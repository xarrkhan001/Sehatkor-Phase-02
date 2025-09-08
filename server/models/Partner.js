import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, trim: true, default: "" },
    logoUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Partner = mongoose.model("Partner", PartnerSchema);
export default Partner;
