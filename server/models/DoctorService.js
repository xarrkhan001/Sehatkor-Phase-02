import mongoose from "mongoose";

const DoctorServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    category: { type: String, default: "Treatment" },
    duration: { type: String },
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
        rating: { type: String, enum: ["Excellent", "Very Good", "Good"] },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
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
    providerType: { type: String, enum: ["doctor"], default: "doctor" },
  },
  { timestamps: true }
);

DoctorServiceSchema.index({ providerId: 1, createdAt: -1 });

const DoctorService = mongoose.model("DoctorService", DoctorServiceSchema);
export default DoctorService;
