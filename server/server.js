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
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import documentRoutes from "./routes/document.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import partnerRoutes from "./routes/partner.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import {
  registerUserSocket,
  unregisterUserSocket,
  getUserSocketIds,
  getOnlineUserIds,
} from "./services/chat.service.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import { facebookCallback } from "./apis/index.js";
import { getModelForServiceType } from "./utils/serviceModelMapper.js";

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
app.use("/api", documentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/clinic", clinicRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/laboratory", laboratoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", contactRoutes);
app.use("/api", partnerRoutes);
app.use("/api", heroRoutes);

// Compatibility: allow callback URL without /api prefix to match FACEBOOK_CALLBACK_URL
app.get("/auth/facebook/callback", facebookCallback);

// Health check for Render
app.get("/api/health", (req, res) => {
  res.status(200).send("ok");
});

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
    origin: allowedOrigins,
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

  socket.on("submit_rating", async (payload, callback) => {
    try {
      console.log("Received rating payload:", payload); // Debug log
      const { serviceId, serviceType, rating, stars } = payload || {};
      if (!serviceId || !serviceType || !rating) {
        return callback?.({ success: false, error: "Missing required fields" });
      }

      const Model = getModelForServiceType(serviceType);
      if (!Model) {
        return callback?.({ success: false, error: "Invalid service type" });
      }

      const service = await Model.findById(serviceId);
      if (!service) {
        return callback?.({ success: false, error: "Service not found" });
      }

      // Normalize any legacy ratings already stored on this document to the new enum
      try {
        if (Array.isArray(service.ratings)) {
          let didChange = false;
          for (const r of service.ratings) {
            if (!r) continue;
            const raw = (r.rating || "").toString().trim().toLowerCase();
            if (raw === "very good") {
              r.rating = "Good";
              didChange = true;
            } else if (raw === "normal") {
              r.rating = "Fair";
              didChange = true;
            } else if (raw === "excellent") {
              r.rating = "Excellent";
            } else if (raw === "good") {
              r.rating = "Good";
            } else if (raw === "fair") {
              r.rating = "Fair";
            }
          }
          if (didChange) {
            try {
              service.markModified && service.markModified("ratings");
            } catch {}
            await service.save();
          }
        }
      } catch {}

      // Normalize incoming rating to the schema's title enum and helpers
      const toTitle = (val) => {
        if (typeof val === "string") {
          const v = val.trim().toLowerCase();
          if (v === "excellent") return "Excellent";
          if (v === "good") return "Good";
          if (v === "fair") return "Fair";
        }
        if (typeof val === "number") {
          if (val >= 4.5) return "Excellent";
          if (val >= 3.5) return "Good";
          if (val > 0) return "Fair";
        }
        return "Good"; // safe default
      };

      const titleToNumeric = (title) => {
        const t = (title || "").toString().trim().toLowerCase();
        if (t === "excellent") return 5;
        if (t === "good") return 4;
        if (t === "fair") return 3;
        return 0;
      };

      const valueToBadge = (valueOrTitle, maybeStars) => {
        // prefer explicit stars if provided; otherwise derive from title
        const n =
          typeof valueOrTitle === "number" && valueOrTitle > 0
            ? valueOrTitle
            : typeof maybeStars === "number" && maybeStars > 0
            ? maybeStars
            : titleToNumeric(valueOrTitle);
        if (n >= 4.5) return "excellent";
        if (n >= 3.5) return "good";
        if (n > 0) return "fair";
        return null;
      };

      const titleInput = toTitle(rating);
      console.log("Rating input:", rating, "Title output:", titleInput); // Debug log

      // Upsert the user's rating (update if exists, otherwise push)
      if (!Array.isArray(service.ratings)) service.ratings = [];
      const idx = (service.ratings || []).findIndex(
        (r) => String(r.user) === String(socket.userId)
      );
      if (idx >= 0) {
        service.ratings[idx].rating = titleInput;
        try {
          const s = Number(stars);
          if (!isNaN(s) && s >= 1 && s <= 5) service.ratings[idx].stars = s;
        } catch {}
      } else {
        const doc = { rating: titleInput, user: socket.userId };
        try {
          const s = Number(stars);
          if (!isNaN(s) && s >= 1 && s <= 5) doc.stars = s;
        } catch {}
        // Ensure doc conforms to enum before push (defensive)
        if (
          doc.rating !== "Excellent" &&
          doc.rating !== "Good" &&
          doc.rating !== "Fair"
        ) {
          doc.rating = "Fair";
        }
        service.ratings.push(doc);
      }

      // Helper to map numeric rating to category
      const toCategory = (n) => {
        if (n >= 4.5) return "excellent";
        if (n >= 3.5) return "good";
        if (n > 0) return "fair";
        return null;
      };

      // Compute averageRating and totalRatings
      const numericRatings = (service.ratings || []).map((r) => {
        const s = Number(r?.stars);
        return !isNaN(s) && s > 0 ? s : titleToNumeric(r?.rating);
      });
      const totalRatings = numericRatings.length;
      const averageRating = totalRatings
        ? numericRatings.reduce((a, b) => a + b, 0) / totalRatings
        : 0;

      // Determine majority category among individual rating categories
      const categoryCounts = (service.ratings || []).reduce((acc, r) => {
        const s = Number(r?.stars);
        const cat = valueToBadge(r?.rating, !isNaN(s) && s > 0 ? s : undefined);
        if (!cat) return acc;
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      let ratingBadge = null;
      let maxCount = -1;
      for (const cat of ["excellent", "good", "fair"]) {
        const count = categoryCounts[cat] || 0;
        if (count > maxCount) {
          maxCount = count;
          ratingBadge = cat;
        }
      }
      // If no category votes yet, derive from average as fallback
      if (!ratingBadge) ratingBadge = toCategory(averageRating) || null;

      // Persist if model contains these fields (safe assigns)
      try {
        service.rating = averageRating;
      } catch {}
      try {
        service.totalRatings = totalRatings;
      } catch {}
      try {
        service.ratingBadge = ratingBadge;
      } catch {}
      await service.save();

      // Broadcast the updated rating to all clients
      io.emit("rating_updated", {
        serviceId,
        serviceType,
        averageRating,
        totalRatings,
        ratingBadge,
      });

      callback?.({ success: true, averageRating, totalRatings, ratingBadge });
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on("disconnect", () => {
    unregisterUserSocket(userId, socket.id);
    io.emit("online_users", getOnlineUserIds());
  });
});

server.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (process.env.DEBUG_SERVER === "true") {
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
    console.log(
      `🔍 Test rating endpoint: http://localhost:${PORT}/api/ratings/test`
    );
  }
});
