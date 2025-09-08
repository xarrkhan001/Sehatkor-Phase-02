import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    // Booking reference (optional for donations)
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    
    // Patient info
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },
    patientContact: { type: String, required: true },
    
    // Provider info (optional for donations)
    providerId: { type: mongoose.Schema.Types.ObjectId },
    providerName: { type: String, required: true },
    providerType: {
      type: String,
      enum: ["doctor", "hospital", "lab", "pharmacy", "admin"],
      required: true,
    },
    
    // Service info (optional for donations)
    serviceId: { type: mongoose.Schema.Types.ObjectId },
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
    // Commission and net settlement fields (optional; filled on release)
    originalAmount: { type: Number }, // original gross amount before commission
    adminCommission: { type: Number }, // percentage e.g., 10 for 10%
    adminCommissionAmount: { type: Number }, // absolute amount deducted
    netReleaseAmount: { type: Number }, // net amount sent to provider after commission
    
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
      phone: { type: String },
      // Donation flags
      isDonation: { type: Boolean, default: false },
      donationNote: { type: String }
    },
    
    // Soft delete for provider wallet (hide from provider's Payment History list)
    deletedForProvider: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
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