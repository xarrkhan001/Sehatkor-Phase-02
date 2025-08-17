import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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
import { facebookCallback } from "./apis/index.js";

dotenv.config();

// Connect to database
let isConnected = false;
const connectToDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

const app = express();

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:8081", 
  "http://localhost:5173",
  "https://sehatkor.vercel.app",
  "https://sehatkor-fullstack.vercel.app"
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Routes
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

// Facebook callback route
app.get("/auth/facebook/callback", facebookCallback);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/api", (req, res) => {
  res.json({ 
    message: "SehatKor API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

export default app;
