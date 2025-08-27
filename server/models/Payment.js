import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Booking reference
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    
    // Patient info
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },
    patientContact: { type: String, required: true },
    
    // Provider info
    providerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    providerName: { type: String, required: true },
    providerType: {
      type: String,
      enum: ["doctor", "hospital", "lab", "pharmacy"],
      required: true,
    },
    
    // Service info
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    serviceName: { type: String, required: true },
    
    // Payment details
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    paymentMethod: { type: String, enum: ["easypaisa", "jazzcash"], required: true },
    paymentNumber: { type: String, required: true },
    transactionId: { type: String, required: true }, // Dummy for now
    
    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "received", "released"],
      default: "received" // Payment goes directly to admin
    },
    
    // Admin payment release
    releasedToProvider: { type: Boolean, default: false },
    releaseDate: { type: Date },
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who released
    releaseNotes: { type: String },
    
    // Service completion
    serviceCompleted: { type: Boolean, default: false },
    completionDate: { type: Date },
    
    // Additional metadata
    metadata: {
      variantIndex: { type: Number },
      variantLabel: { type: String },
      variantTimeRange: { type: String },
      image: { type: String },
      location: { type: String },
      phone: { type: String }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
PaymentSchema.index({ patientId: 1, createdAt: -1 });
PaymentSchema.index({ providerId: 1, createdAt: -1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ releasedToProvider: 1 });

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;