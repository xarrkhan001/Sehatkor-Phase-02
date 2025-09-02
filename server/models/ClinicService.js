import mongoose from "mongoose";

const ClinicServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    department: { type: String },
    category: { type: String, default: "Treatment" },
    duration: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    googleMapLink: { type: String },
    city: { type: String },
    detailAddress: { type: String },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerName: { type: String, required: true },
    providerType: { type: String, enum: ["clinic"], default: "clinic" },
    availability: { 
      type: String, 
      enum: ["Online", "Physical", "Online and Physical"], 
      default: "Physical" 
    },
    serviceType: {
      type: String,
      enum: ["Sehat Card", "Private", "Charity", "Public", "NPO", "NGO"],
      default: "Private"
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    ratings: [
      {
        rating: { type: String, enum: ["Excellent", "Good", "Fair"] },
        stars: { type: Number, min: 1, max: 5 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratingBadge: {
      type: String,
      default: "No Rating",
    },
  },
  { timestamps: true }
);

ClinicServiceSchema.index({ providerId: 1, createdAt: -1 });

const ClinicService = mongoose.model("ClinicService", ClinicServiceSchema);
export default ClinicService;
