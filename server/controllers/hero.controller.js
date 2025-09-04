import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import HeroImage from "../models/HeroImage.js";

function uploadImageToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sehatkor/hero",
        resource_type: "image",
        ...opts,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const listHeroImages = async (_req, res) => {
  try {
    const items = await HeroImage.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, images: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to load images" });
  }
};

export const createHeroImage = async (req, res) => {
  try {
    const { title, isActive, order } = req.body || {};
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "Image file is required" });
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image files are allowed" });
    }
    const result = await uploadImageToCloudinary(file.buffer);
    const doc = await HeroImage.create({
      url: result.secure_url,
      publicId: result.public_id,
      title: (title || "").toString().trim(),
      isActive: typeof isActive === "undefined" ? true : !!JSON.parse(String(isActive).toLowerCase()),
      order: typeof order === "undefined" ? 0 : Number(order) || 0,
    });
    res.status(201).json({ success: true, image: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to create image" });
  }
};

export const updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isActive, order } = req.body || {};
    const file = req.file;
    const img = await HeroImage.findById(id);
    if (!img) return res.status(404).json({ success: false, message: "Image not found" });

    if (typeof title === "string") img.title = title.trim();
    if (typeof isActive !== "undefined") img.isActive = isActive === "true" || isActive === true;
    if (typeof order !== "undefined") img.order = Number(order) || 0;

    if (file) {
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ success: false, message: "Only image files are allowed" });
      }
      try { await cloudinary.uploader.destroy(img.publicId, { resource_type: "image" }); } catch {}
      const result = await uploadImageToCloudinary(file.buffer);
      img.url = result.secure_url;
      img.publicId = result.public_id;
    }

    await img.save();
    res.json({ success: true, image: img });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to update image" });
  }
};

export const deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const img = await HeroImage.findById(id);
    if (!img) return res.status(404).json({ success: false, message: "Image not found" });
    try { await cloudinary.uploader.destroy(img.publicId, { resource_type: "image" }); } catch {}
    await HeroImage.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to delete image" });
  }
};
