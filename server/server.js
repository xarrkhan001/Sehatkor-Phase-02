import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { connectDB } from "./config/index.js";
import uploadRoutes from "./routes/upload.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import clinicRoutes from "./routes/clinic.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import laboratoryRoutes from "./routes/laboratory.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import {
  registerUserSocket,
  unregisterUserSocket,
  getUserSocketIds,
  getOnlineUserIds,
} from "./services/chat.service.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import { facebookCallback } from "./apis/index.js";

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173",
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Enable gzip compression to reduce payload sizes (safe, non-breaking)
app.use(
  compression({
    threshold: 1024, // compress responses >1KB
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/laboratory", laboratoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connections", connectionRoutes);

// Compatibility: allow callback URL without /api prefix to match FACEBOOK_CALLBACK_URL
app.get("/auth/facebook/callback", facebookCallback);

console.log("🟢 server.js starting...");
let PORT = process.env.PORT;
if (!PORT || isNaN(Number(PORT))) {
  console.warn("⚠️  Invalid or missing PORT in .env. Using default port 4000.");
  PORT = 4000;
} else {
  PORT = Number(PORT);
}
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:5173",
    ],
    credentials: true,
  },
  path: "/socket.io",
});

// Expose io to express routes/controllers
app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication token missing"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  registerUserSocket(userId, socket.id);
  // Notify all about current online users
  io.emit("online_users", getOnlineUserIds());

  socket.on("join_conversation", (conversationId) => {
    if (conversationId) socket.join(String(conversationId));
  });

  socket.on("send_message", async (payload, callback) => {
    try {
      const {
        conversationId,
        recipientId,
        type,
        text,
        fileUrl,
        fileName,
        fileSize,
      } = payload || {};
      if (!conversationId || !recipientId) return;

      // Disallow videos and unknown types
      const allowedTypes = new Set(["text", "image"]);
      const normalizedType = type || "text";
      if (!allowedTypes.has(normalizedType)) {
        if (callback)
          callback({ success: false, error: "Unsupported message type" });
        return;
      }

      // Ensure conversation exists (invitation flow removed)
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        if (callback)
          callback({ success: false, error: "Conversation not found" });
        return;
      }

      const message = await Message.create({
        conversationId,
        sender: userId,
        recipient: recipientId,
        type: normalizedType,
        text,
        fileUrl,
        fileName,
        fileSize,
      });
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          text:
            (normalizedType === "text" ? text : fileName || normalizedType) ||
            "",
          type: normalizedType,
          sender: userId,
          createdAt: new Date(),
        },
      });

      // Emit to the conversation room (participants who have joined the room)
      const roomId = String(conversationId);
      io.to(roomId).emit("new_message", message);

      // Additionally, notify recipient sockets that are connected but have not joined the room yet
      try {
        const recipientSocketIds = getUserSocketIds(recipientId) || [];
        for (const sid of recipientSocketIds) {
          const s = io.sockets.sockets.get(sid);
          if (s && !s.rooms.has(roomId)) {
            s.emit("new_message", message);
          }
        }
      } catch {}
      if (callback) callback({ success: true, message });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Delete message via socket
  socket.on("delete_message", async (payload, callback) => {
    try {
      const { messageId, scope } = payload || {};
      if (!messageId) {
        if (callback)
          callback({ success: false, error: "messageId is required" });
        return;
      }
      const message = await Message.findById(messageId);
      if (!message) {
        if (callback) callback({ success: false, error: "Message not found" });
        return;
      }
      const conversationId = String(message.conversationId);
      if (scope === "everyone") {
        // Only sender can delete for everyone
        if (String(message.sender) !== String(userId)) {
          if (callback)
            callback({
              success: false,
              error: "Only sender can delete for everyone",
            });
          return;
        }
        await Message.deleteOne({ _id: messageId });
        io.to(conversationId).emit("message_deleted", {
          messageId,
          conversationId,
        });
        if (callback) callback({ success: true, scope: "everyone" });
      } else {
        // delete for me: mark soft delete
        const already = (message.deletedFor || []).some(
          (u) => String(u) === String(userId)
        );
        if (!already) {
          message.deletedFor = [...(message.deletedFor || []), userId];
          await message.save();
        }
        if (callback) callback({ success: true, scope: "me" });
      }
    } catch (err) {
      if (callback)
        callback({ success: false, error: err?.message || "Failed to delete" });
    }
  });

  socket.on("disconnect", () => {
    unregisterUserSocket(userId, socket.id);
    io.emit("online_users", getOnlineUserIds());
  });
});

server.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
