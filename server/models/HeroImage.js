import mongoose from "mongoose";

const HeroImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    title: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const HeroImage = mongoose.model("HeroImage", HeroImageSchema);
export default HeroImage;
