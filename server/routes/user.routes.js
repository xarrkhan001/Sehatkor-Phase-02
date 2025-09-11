import express from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllPublicServices,
  getPublicServiceById,
  getUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public endpoint to get all services from all providers (with optional auth for personal ratings)
router.get("/services/public", optionalAuthMiddleware, getAllPublicServices);
router.get("/services/public/:serviceId", getPublicServiceById);

// Public route to get user by ID
router.get("/public/:userId", getUserById);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/account", authMiddleware, deleteUserAccount);

export default router;
