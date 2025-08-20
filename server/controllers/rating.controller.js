import Rating from "../models/Rating.js";
import DoctorService from "../models/DoctorService.js";
import ClinicService from "../models/ClinicService.js";
import LaboratoryTest from "../models/LaboratoryTest.js";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";

// Get service model based on type
const getServiceModel = (serviceType) => {
  switch (serviceType) {
    case "doctor":
      return DoctorService;
    case "clinic":
      return ClinicService;
    case "laboratory":
      return LaboratoryTest;
    case "pharmacy":
      return Medicine;
    default:
      throw new Error("Invalid service type");
  }
};

// Update service average rating
const updateServiceRating = async (serviceId, serviceType) => {
  try {
    const ServiceModel = getServiceModel(serviceType);

    // Calculate average rating
    const ratingStats = await Rating.aggregate([
      { $match: { serviceId: serviceId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalRatings: 0 };

    // Update service with new rating
    await ServiceModel.findByIdAndUpdate(serviceId, {
      averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: stats.totalRatings,
    });

    return stats;
  } catch (error) {
    throw new Error(`Failed to update service rating: ${error.message}`);
  }
};

// Add or update rating
export const addRating = async (req, res) => {
  try {
    if (process.env.DEBUG_RATINGS === "true") {
      console.log("Rating request received:", {
        body: req.body,
        userId: req.userId,
        userRole: req.userRole,
        headers: req.headers.authorization ? "Token present" : "No token",
      });
    }

    const { serviceId, serviceType, rating, review } = req.body;
    const patientId = req.userId;
    const userRole = req.userRole;

    // Basic validations
    if (!patientId) {
      if (process.env.DEBUG_RATINGS === "true")
        console.log("No patientId found");
      return res
        .status(401)
        .json({ message: "Unauthorized - No user ID found" });
    }
    if (!serviceId || !serviceType) {
      if (process.env.DEBUG_RATINGS === "true")
        console.log("Missing serviceId or serviceType:", {
          serviceId,
          serviceType,
        });
      return res
        .status(400)
        .json({ message: "serviceId and serviceType are required" });
    }
    const allowedTypes = ["doctor", "clinic", "laboratory", "pharmacy"];
    if (!allowedTypes.includes(serviceType)) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Patients only
    if (userRole && userRole !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can submit ratings" });
    }

    // Get service to find providerId
    const ServiceModel = getServiceModel(serviceType);
    const service = await ServiceModel.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Prevent providers from rating their own services
    if (String(service.providerId) === String(patientId)) {
      return res
        .status(403)
        .json({ message: "You cannot rate your own service" });
    }

    // Resolve patient name (optional)
    let patientName = undefined;
    try {
      const user = await User.findById(patientId).select("name");
      patientName = user?.name;
    } catch (_) {
      // ignore name resolution failure
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ serviceId, patientId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || "";
      await existingRating.save();
    } else {
      // Create new rating
      await Rating.create({
        serviceId,
        serviceType,
        patientId,
        providerId: service.providerId,
        rating,
        review: review || "",
        patientName: patientName || "Patient",
      });
    }

    // Update service average rating
    const stats = await updateServiceRating(serviceId, serviceType);

    res.status(200).json({
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
    });
  } catch (error) {
    if (process.env.DEBUG_RATINGS === "true") {
      console.error("Add rating error:", error);
      console.error("Stack trace:", error.stack);
    }
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get ratings for a service
export const getServiceRatings = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ serviceId })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ serviceId });

    res.status(200).json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get service ratings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get ratings by provider
export const getProviderRatings = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ providerId })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ providerId });

    // Get average rating for provider
    const ratingStats = await Rating.aggregate([
      { $match: { providerId: providerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalRatings: 0 };

    res.status(200).json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalRatings: stats.totalRatings,
    });
  } catch (error) {
    console.error("Get provider ratings error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete rating (only by patient who created it)
export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const patientId = req.userId;

    const rating = await Rating.findOne({ _id: ratingId, patientId });

    if (!rating) {
      return res
        .status(404)
        .json({ message: "Rating not found or unauthorized" });
    }

    await Rating.findByIdAndDelete(ratingId);

    // Update service average rating
    await updateServiceRating(rating.serviceId, rating.serviceType);

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({ message: error.message });
  }
};
