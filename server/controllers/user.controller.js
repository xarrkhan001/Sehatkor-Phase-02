// controllers/user.controller.js
import User from "../models/User.js";
import DoctorService from "../models/DoctorService.js";
import ClinicService from "../models/ClinicService.js";
import Medicine from "../models/Medicine.js";
import LaboratoryTest from "../models/LaboratoryTest.js";

// Get all public services from all providers
export const getAllPublicServices = async (req, res) => {
  try {
    // Fetch services from all providers with provider details
    const [
      doctorServices,
      clinicServices,
      pharmacyServices,
      laboratoryServices,
    ] = await Promise.all([
      DoctorService.find({})
        .populate("providerId", "phone")
        .sort({ createdAt: -1 }),
      ClinicService.find({})
        .populate("providerId", "phone")
        .sort({ createdAt: -1 }),
      Medicine.find({}).populate("providerId", "phone").sort({ createdAt: -1 }),
      LaboratoryTest.find({})
        .populate("providerId", "phone")
        .sort({ createdAt: -1 }),
    ]);

    // Combine all services with provider type information and phone numbers
    const allServices = [
      ...doctorServices.map((service) => ({
        ...service.toObject(),
        providerType: "doctor",
        providerPhone: service.providerId?.phone || null,
      })),
      ...clinicServices.map((service) => ({
        ...service.toObject(),
        providerType: "clinic",
        providerPhone: service.providerId?.phone || null,
      })),
      ...pharmacyServices.map((service) => ({
        ...service.toObject(),
        providerType: "pharmacy",
        providerPhone: service.providerId?.phone || null,
      })),
      ...laboratoryServices.map((service) => ({
        ...service.toObject(),
        providerType: "laboratory",
        providerPhone: service.providerId?.phone || null,
      })),
    ];

    res.status(200).json({
      services: allServices,
      total: allServices.length,
      byType: {
        doctor: doctorServices.length,
        clinic: clinicServices.length,
        pharmacy: pharmacyServices.length,
        laboratory: laboratoryServices.length,
      },
    });
  } catch (error) {
    console.error("Error fetching public services:", error);
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, phone, address },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting account", error: error.message });
  }
};

// 📌 Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// 📌 Admin: Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users by role", error: error.message });
  }
};
