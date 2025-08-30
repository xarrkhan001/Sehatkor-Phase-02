import ClinicService from "../models/ClinicService.js";
import cloudinary from "../config/cloudinary.js";

export const listClinicServices = async (req, res) => {
  try {
    const services = await ClinicService.find({ providerId: req.userId }).sort({
      createdAt: -1,
    }).lean();
    const formattedServices = services.map(s => ({ ...s, id: s._id }));
    res.status(200).json({ services: formattedServices });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

export const createClinicService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      department,
      category,
      duration,
      imageUrl,
      imagePublicId,
      providerName,
      googleMapLink,
      city,
      detailAddress,
      availability,
    } = req.body || {};
    if (!name) return res.status(400).json({ message: "Name is required" });
    const doc = await ClinicService.create({
      name,
      description: description || "",
      price: typeof price === "number" ? price : Number(price) || 0,
      department,
      category: category || "Treatment",
      duration,
      imageUrl,
      imagePublicId,
      googleMapLink,
      city,
      detailAddress,
      providerId: req.userId,
      providerName: providerName || "Clinic",
      providerType: "clinic",
      availability: availability || "Physical",
    });
    res.status(201).json({ service: doc });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
};

export const updateClinicService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const doc = await ClinicService.findOneAndUpdate(
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
          ...(updates.department != null && { department: updates.department }),
          ...(updates.category != null && { category: updates.category }),
          ...(updates.duration != null && { duration: updates.duration }),
          ...(updates.imageUrl != null && { imageUrl: updates.imageUrl }),
          ...(updates.imagePublicId != null && {
            imagePublicId: updates.imagePublicId,
          }),
          ...(updates.googleMapLink != null && { googleMapLink: updates.googleMapLink }),
          ...(updates.city != null && { city: updates.city }),
          ...(updates.detailAddress != null && { detailAddress: updates.detailAddress }),
          ...(updates.availability != null && { availability: updates.availability }),
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

export const deleteClinicService = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ClinicService.findOneAndDelete({
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
