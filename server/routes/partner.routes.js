import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partner.controller.js";

const router = express.Router();

// Public: list partners for marquee
router.get("/partners", listPartners);

// Admin endpoints (protect later with authMiddleware if needed)
// router.use(authMiddleware);
router.post("/partners", upload.single("logo"), createPartner);
router.put("/partners/:id", upload.single("logo"), updatePartner);
router.delete("/partners/:id", deletePartner);

export default router;
