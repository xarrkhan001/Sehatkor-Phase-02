import mongoose from "mongoose";

// Each service can have multiple time/location variants
const ServiceVariantSchema = new mongoose.Schema(
  {
    timeLabel: { type: String, trim: true }, // e.g., Morning, Evening
    startTime: { type: String }, // e.g., 09:00
    endTime: { type: String },   // e.g., 12:00
    days: [{ type: String }],    // e.g., ["Mon", "Wed", "Fri"]
    price: { type: Number },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    googleMapLink: { type: String },
    city: { type: String },
    detailAddress: { type: String },
    notes: { type: String },
    availability: { 
      type: String, 
      enum: ["Online", "Physical", "Online and Physical"], 
      default: "Physical" 
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

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
    // Associated diseases for this service (service-level)
    diseases: { type: [String], default: [] },
    // New: array of variants for time/location/image specific offerings
    variants: { type: [ServiceVariantSchema], default: [] },
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
    providerType: { type: String, enum: ["doctor"], default: "doctor" },
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
    // Indicates if the doctor service supports home delivery/visit
    homeDelivery: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DoctorServiceSchema.index({ providerId: 1, createdAt: -1 });

const DoctorService = mongoose.model("DoctorService", DoctorServiceSchema);
export default DoctorService;
