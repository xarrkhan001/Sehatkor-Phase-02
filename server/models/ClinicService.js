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
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerName: { type: String, required: true },
    providerType: { type: String, enum: ["clinic"], default: "clinic" },
  },
  { timestamps: true }
);

ClinicServiceSchema.index({ providerId: 1, createdAt: -1 });

const ClinicService = mongoose.model("ClinicService", ClinicServiceSchema);
export default ClinicService;
