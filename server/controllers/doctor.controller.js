// controllers/doctor.controller.js
import User from "../models/User.js";
import DoctorService from "../models/DoctorService.js";
import cloudinary from "../config/cloudinary.js";

// 📌 Get current doctor's profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.userId).select("-password").lean();
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving doctor profile",
      error: error.message,
    });
  }
};

// 📌 Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;

    const doctor = await User.findById(req.userId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }

    Object.assign(doctor, updates);
    await doctor.save();

    res.status(200).json({ message: "Doctor profile updated", doctor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating doctor profile", error: error.message });
  }
};

// 📌 Get all verified doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", verified: true })
      .select("-password")
      .lean();
    res.status(200).json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: error.message });
  }
};

// 🔍 Search doctor by name or specialization
export const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;

    const doctors = await User.find({
      role: "doctor",
      verified: true,
      $or: [
        { name: new RegExp(query, "i") },
        { specialization: new RegExp(query, "i") },
      ],
    })
      .select("-password")
      .lean();

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

// 🩺 Get doctor profile by ID (for patient viewing)
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      verified: true,
    })
      .select("-password")
      .lean();

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving doctor details",
      error: error.message,
    });
  }
};

// ===== Doctor Services CRUD =====
export const listDoctorServices = async (req, res) => {
  try {
    const services = await DoctorService.find({ providerId: req.userId })
      .sort({ createdAt: -1 })
      .lean();
    const formattedServices = services.map((s) => ({ ...s, id: s._id }));
    res.status(200).json({ services: formattedServices });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

export const createDoctorService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      duration,
      imageUrl,
      imagePublicId,
      providerName,
      googleMapLink,
      city,
      detailAddress,
      variants,
      diseases,
    } = req.body || {};
    if (!name) return res.status(400).json({ message: "Name is required" });
    const doc = await DoctorService.create({
      name,
      description: description || "",
      price: typeof price === "number" ? price : Number(price) || 0,
      category: category || "Treatment",
      duration,
      imageUrl,
      imagePublicId,
      googleMapLink,
      city,
      detailAddress,
      // If variants provided, store them; else default to [] to keep compatibility
      variants: Array.isArray(variants) ? variants : [],
      diseases: Array.isArray(diseases) ? diseases : [],
      providerId: req.userId,
      providerName: providerName || "Doctor",
      providerType: "doctor",
    });
    res.status(201).json({ service: doc });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
};

export const updateDoctorService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const doc = await DoctorService.findOneAndUpdate(
      { _id: id, providerId: req.userId },
      {
        $set: {
          ...(updates.name != null && { name: updates.name }),
          ...(updates.description != null && {
            description: updates.description,
          }),
          ...(updates.price != null && {
            price:
              typeof updates.price === "number"
                ? updates.price
                : Number(updates.price) || 0,
          }),
          ...(updates.category != null && { category: updates.category }),
          ...(updates.duration != null && { duration: updates.duration }),
          ...(updates.imageUrl != null && { imageUrl: updates.imageUrl }),
          ...(updates.imagePublicId != null && {
            imagePublicId: updates.imagePublicId,
          }),
          ...(updates.googleMapLink != null && {
            googleMapLink: updates.googleMapLink,
          }),
          ...(updates.city != null && { city: updates.city }),
          ...(updates.detailAddress != null && {
            detailAddress: updates.detailAddress,
          }),
          // Allow full variants replacement when provided
          ...(Array.isArray(updates.variants) && { variants: updates.variants }),
          // Allow diseases replacement when provided
          ...(Array.isArray(updates.diseases) && { diseases: updates.diseases }),
        },
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ service: doc });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating service", error: error.message });
  }
};

export const deleteDoctorService = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DoctorService.findOneAndDelete({
      _id: id,
      providerId: req.userId,
    });
    if (!doc) return res.status(404).json({ message: "Service not found" });
    try {
      if (doc.imagePublicId)
        await cloudinary.uploader.destroy(doc.imagePublicId, {
          resource_type: "image",
        });
    } catch {}
    res.status(200).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting service", error: error.message });
  }
};
