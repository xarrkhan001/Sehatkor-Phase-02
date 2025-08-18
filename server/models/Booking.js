import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "serviceModel",
    },
    serviceModel: {
      type: String,
      required: true,
      enum: ["ClinicService", "DoctorService", "LaboratoryTest", "Medicine"],
    },
    serviceSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["JazzCash", "EasyPaisa", "Bank Transfer"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ buyer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
