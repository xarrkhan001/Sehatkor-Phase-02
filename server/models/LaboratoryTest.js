import mongoose from "mongoose";

const LaboratoryTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "Test" }, // e.g., Blood Test, Urine Test, X-Ray
    duration: { type: String }, // e.g., "2-3 hours", "Same day"
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
    providerType: { type: String, enum: ["laboratory"], default: "laboratory" },
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

LaboratoryTestSchema.index({ providerId: 1, createdAt: -1 });

const LaboratoryTest = mongoose.model("LaboratoryTest", LaboratoryTestSchema);
export default LaboratoryTest;
