// controllers/user.controller.js
import User from "../models/User.js";
import DoctorService from "../models/DoctorService.js";
import ClinicService from "../models/ClinicService.js";
import Medicine from "../models/Medicine.js";
import LaboratoryTest from "../models/LaboratoryTest.js";

// Get all public services from all providers
export const getAllPublicServices = async (req, res) => {
  try {
    // Optional filtering & pagination
    const type = (req.query.type || "").toString().toLowerCase();
    const hasType = ["doctor", "clinic", "pharmacy", "laboratory"].includes(
      type
    );
    const page = Math.max(1, Number(req.query.page) || 0);
    const limitRaw = Number(req.query.limit) || 0;
    const limit = limitRaw > 0 ? Math.min(limitRaw, 100) : 0; // cap to 100
    const disease = (req.query.disease || "").toString().trim();

    // Fetch services from all providers with provider details
    let doctorServices = [];
    let clinicServices = [];
    let pharmacyServices = [];
    let laboratoryServices = [];

    // Helper to optionally apply pagination
    const applyPaging = (q) => {
      if (hasType && page && limit) {
        return q.skip((page - 1) * limit).limit(limit);
      }
      return q;
    };

    if (!hasType || type === "doctor") {
      // Build query for doctor services, optionally filtered by disease
      const docQuery = {};
      if (disease) {
        // Escape regex special characters to avoid unintended patterns
        const escapeRegExp = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const normalized = disease.trim();
        // Also create a variant with parenthetical content removed, e.g. "(DNS)"
        const withoutParens = normalized
          .replace(/\s*\([^)]*\)\s*/g, " ") // remove ( ... )
          .replace(/\s+/g, " ")
          .trim();
        // Extract acronym within parentheses if present, e.g., DNS from "(DNS)"
        const m = normalized.match(/\(([^)]+)\)/);
        const acronym = m && m[1] ? m[1].trim() : "";

        const rxList = [
          // exact match with optional surrounding whitespace
          new RegExp(`^\\s*${escapeRegExp(normalized)}\\s*$`, "i"),
        ];
        if (withoutParens && withoutParens.toLowerCase() !== normalized.toLowerCase()) {
          rxList.push(new RegExp(`^\\s*${escapeRegExp(withoutParens)}\\s*$`, "i"));
        }
        if (acronym) {
          rxList.push(new RegExp(`^\\s*${escapeRegExp(acronym)}\\s*$`, "i"));
        }
        // Fallback: partial contains to catch minor punctuation/spacing variants
        rxList.push(new RegExp(`${escapeRegExp(withoutParens || normalized)}`, "i"));

        // Match diseases array elements against any of the variants
        docQuery.diseases = { $in: rxList };
      }
      doctorServices = await applyPaging(
        DoctorService.find(docQuery)
          .populate("providerId", "phone name avatar")
          .sort({ createdAt: -1 })
      ).lean();
    }
    if (!hasType || type === "clinic") {
      clinicServices = await applyPaging(
        ClinicService.find({})
          .populate("providerId", "phone name avatar")
          .sort({ createdAt: -1 })
      ).lean();
    }
    if (!hasType || type === "pharmacy") {
      pharmacyServices = await applyPaging(
        Medicine.find({})
          .populate("providerId", "phone name avatar")
          .sort({ createdAt: -1 })
      ).lean();
    }
    if (!hasType || type === "laboratory") {
      laboratoryServices = await applyPaging(
        LaboratoryTest.find({})
          .populate("providerId", "phone name avatar")
          .sort({ createdAt: -1 })
      ).lean();
    }

    // Combine all services with provider type information, phone numbers, and rating data
    const allServices = [
      ...doctorServices.map((service) => ({
        ...(service.toObject ? service.toObject() : service),
        id: service._id,
        providerType: "doctor",
        providerPhone: service.providerId?.phone || null,
        // ensure latest name overrides any stale providerName on the document
        providerName: service.providerId?.name || service.providerName,
        rating: service.rating ?? service.averageRating ?? 0,
        averageRating: service.rating ?? service.averageRating ?? 0,
        totalRatings: service.totalRatings ?? 0,
        ratingBadge: service.ratingBadge || null,
        serviceType: service.serviceType || "Private",
        availability: service.availability || "Physical",
        homeDelivery: Boolean(service.homeDelivery) || false,
        // Hospital/Clinic name
        hospitalClinicName: service.hospitalClinicName || null,
        // expose main service schedule fields
        timeLabel: service.timeLabel || null,
        startTime: service.startTime || null,
        endTime: service.endTime || null,
        days: Array.isArray(service.days) ? service.days : [],
      })),
      ...clinicServices.map((service) => ({
        ...(service.toObject ? service.toObject() : service),
        id: service._id,
        providerType: "clinic",
        providerPhone: service.providerId?.phone || null,
        providerName: service.providerId?.name || service.providerName,
        rating: service.rating ?? service.averageRating ?? 0,
        averageRating: service.rating ?? service.averageRating ?? 0,
        totalRatings: service.totalRatings ?? 0,
        ratingBadge: service.ratingBadge || null,
        serviceType: service.serviceType || "Private",
        availability: service.availability || "Physical",
        homeDelivery: Boolean(service.homeDelivery) || false,
        // expose main service schedule fields
        timeLabel: service.timeLabel || null,
        startTime: service.startTime || null,
        endTime: service.endTime || null,
        days: Array.isArray(service.days) ? service.days : [],
      })),
      ...pharmacyServices.map((service) => ({
        ...(service.toObject ? service.toObject() : service),
        id: service._id,
        providerType: "pharmacy",
        providerPhone: service.providerId?.phone || null,
        providerName: service.providerId?.name || service.providerName,
        rating: service.rating ?? service.averageRating ?? 0,
        averageRating: service.rating ?? service.averageRating ?? 0,
        totalRatings: service.totalRatings ?? 0,
        ratingBadge: service.ratingBadge || null,
        // expose main service schedule fields
        timeLabel: service.timeLabel || null,
        startTime: service.startTime || null,
        endTime: service.endTime || null,
        days: Array.isArray(service.days) ? service.days : [],
      })),
      ...laboratoryServices.map((service) => ({
        ...(service.toObject ? service.toObject() : service),
        id: service._id,
        providerType: "laboratory",
        providerPhone: service.providerId?.phone || null,
        providerName: service.providerId?.name || service.providerName,
        rating: service.rating ?? service.averageRating ?? 0,
        averageRating: service.rating ?? service.averageRating ?? 0,
        totalRatings: service.totalRatings ?? 0,
        ratingBadge: service.ratingBadge || null,
        serviceType: service.serviceType || "Private",
        availability: service.availability || "Physical",
        // expose main service schedule fields
        timeLabel: service.timeLabel || null,
        startTime: service.startTime || null,
        endTime: service.endTime || null,
        days: Array.isArray(service.days) ? service.days : [],
      })),
    ];

    const response = {
      services: allServices,
      total: allServices.length,
      byType: {
        doctor: doctorServices.length,
        clinic: clinicServices.length,
        pharmacy: pharmacyServices.length,
        laboratory: laboratoryServices.length,
      },
    };
    if (hasType && page && limit) {
      response.page = page;
      response.limit = limit;
      response.hasMore = allServices.length === limit; // simple indicator
    }
    res.status(200).json(response);
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
    const user = await User.findById(req.userId).select("-password").lean();
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

export const getPublicServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { type } = req.query;

    if (!serviceId || !type) {
      return res.status(400).json({ message: "Service ID and type are required" });
    }

    const modelMap = {
      doctor: DoctorService,
      clinic: ClinicService,
      pharmacy: Medicine,
      laboratory: LaboratoryTest,
    };

    const ServiceModel = modelMap[type];
    let service = null;

    if (ServiceModel) {
      service = await ServiceModel.findById(serviceId)
        .populate("providerId", "phone name avatar")
        .lean();
    }

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Compute per-category rating counts from embedded ratings array (if present)
    const counts = { excellent: 0, good: 0, fair: 0 };
    try {
      const ratingsArr = Array.isArray(service.ratings) ? service.ratings : [];
      for (const r of ratingsArr) {
        const raw = ((r && (r.rating ?? r.title)) || "").toString().trim().toLowerCase();
        if (raw === "excellent") counts.excellent += 1;
        else if (raw === "very good" || raw === "good") counts.good += 1;
        else if (raw === "normal" || raw === "fair") counts.fair += 1;
        else if (typeof r?.stars === "number") {
          const s = Number(r.stars);
          if (s >= 5) counts.excellent += 1; else if (s >= 4) counts.good += 1; else if (s > 0) counts.fair += 1;
        }
      }
    } catch {}

    const serviceObject = {
      ...(service.toObject ? service.toObject() : service),
      id: service._id,
      providerType: type,
      providerPhone: service.providerId?.phone || null,
      // ensure latest name
      providerName: service.providerId?.name || service.providerName,
      rating: service.averageRating || 0,
      averageRating: service.averageRating || 0,
      totalRatings: service.totalRatings || 0,
      ratingBadge: service.ratingBadge || null,
      ratingCounts: counts,
      // Hospital/Clinic name
      hospitalClinicName: service.hospitalClinicName || null,
      // expose main service schedule fields
      timeLabel: service.timeLabel || null,
      startTime: service.startTime || null,
      endTime: service.endTime || null,
      days: Array.isArray(service.days) ? service.days : [],
    };

    res.status(200).json(serviceObject);
  } catch (error) {
    console.error("Error fetching public service by ID:", error);
    res.status(500).json({
      message: "Error fetching service",
      error: error.message,
    });
  }
};

// 📌 Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
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
    const users = await User.find({ role }).select("-password").lean();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users by role", error: error.message });
  }
};

// Get user by ID for public profile
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpire").lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};
