import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllPublicServices,
  getPublicServiceById,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public endpoint to get all services from all providers
router.get("/services/public", getAllPublicServices);
router.get("/services/public/:serviceId", getPublicServiceById);

// Protected routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/account", authMiddleware, deleteUserAccount);

export default router;
