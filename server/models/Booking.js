import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },

    providerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    providerName: { type: String, required: true },
    providerType: {
      type: String,
      enum: ["doctor", "hospital", "lab", "pharmacy"],
      required: true,
    },

    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    serviceName: { type: String, required: true },

    // Pricing
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'PKR' },

    paymentMethod: { type: String, enum: ["easypaisa", "jazzcash"], required: true },
    paymentNumber: { type: String, required: true },

    // Variant context (for multi-variant services)
    variantIndex: { type: Number },
    variantLabel: { type: String },
    variantTimeRange: { type: String },

    // Snapshot info for convenience
    image: { type: String },
    location: { type: String },
    phone: { type: String },

    status: {
      type: String,
      enum: ["Confirmed", "Scheduled", 'Completed', "Cancelled"],
      default: "Confirmed",
    },

    scheduledTime: { type: Date },
    communicationChannel: { type: String },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
