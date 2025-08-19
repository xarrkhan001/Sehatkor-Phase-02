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

    paymentMethod: { type: String, enum: ["easypaisa", "jazzcash"], required: true },
    paymentNumber: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
