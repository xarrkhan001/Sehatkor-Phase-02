import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import Partner from "../models/Partner.js";

function uploadPngToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sehatkor/partners",
        resource_type: "image",
        format: "png",
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

export const listPartners = async (_req, res) => {
  const items = await Partner.find({ isActive: true }).sort({
    order: 1,
    createdAt: -1,
  });
  res.json({ success: true, partners: items });
};

export const createPartner = async (req, res) => {
  try {
    const { name } = req.body || {};
    const file = req.file;
    if (!name || !file)
      return res
        .status(400)
        .json({ success: false, message: "name and logo (png) required" });
    if (file.mimetype !== "image/png")
      return res
        .status(400)
        .json({ success: false, message: "Only PNG allowed" });
    const result = await uploadPngToCloudinary(file.buffer);
    const partner = await Partner.create({
      name: name.trim(),
      logoUrl: result.secure_url,
      publicId: result.public_id,
    });
    res.status(201).json({ success: true, partner });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: err?.message || "Failed to create partner",
      });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive, order } = req.body || {};
    const file = req.file;
    const partner = await Partner.findById(id);
    if (!partner)
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });

    if (typeof name === "string" && name.trim()) partner.name = name.trim();
    if (typeof isActive !== "undefined") partner.isActive = !!isActive;
    if (typeof order !== "undefined") partner.order = Number(order) || 0;

    if (file) {
      if (file.mimetype !== "image/png")
        return res
          .status(400)
          .json({ success: false, message: "Only PNG allowed" });
      try {
        await cloudinary.uploader.destroy(partner.publicId, {
          resource_type: "image",
        });
      } catch {}
      const result = await uploadPngToCloudinary(file.buffer);
      partner.logoUrl = result.secure_url;
      partner.publicId = result.public_id;
    }

    await partner.save();
    res.json({ success: true, partner });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: err?.message || "Failed to update partner",
      });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner)
      return res
        .status(404)
        .json({ success: false, message: "Partner not found" });
    try {
      await cloudinary.uploader.destroy(partner.publicId, {
        resource_type: "image",
      });
    } catch {}
    await Partner.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: err?.message || "Failed to delete partner",
      });
  }
};
