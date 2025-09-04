import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  listHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
} from "../controllers/hero.controller.js";

const router = express.Router();

// Public: list active hero images
router.get("/hero-images", listHeroImages);

// Admin: create/update/delete hero images
router.post("/hero-images", upload.single("image"), createHeroImage);
router.put("/hero-images/:id", upload.single("image"), updateHeroImage);
router.delete("/hero-images/:id", deleteHeroImage);

export default router;
