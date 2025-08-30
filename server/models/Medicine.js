import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "Other" },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    googleMapLink: { type: String },
    city: { type: String },
    detailAddress: { type: String },
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
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerName: { type: String, required: true },
    providerType: { type: String, enum: ["pharmacy"], default: "pharmacy" },
    availability: { 
      type: String, 
      enum: ["Online", "Physical", "Online and Physical"], 
      default: "Physical" 
    },
  },
  { timestamps: true }
);

MedicineSchema.index({ providerId: 1, createdAt: -1 });

const Medicine = mongoose.model("Medicine", MedicineSchema);
export default Medicine;
