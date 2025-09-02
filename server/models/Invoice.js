import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    serviceName: { type: String, required: true },
    patientName: { type: String, required: true },
    originalAmount: { type: Number, required: true },
    adminCommissionAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    completionDate: { type: Date },
    releaseDate: { type: Date },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerName: { type: String, required: true },
    providerType: { type: String, enum: ["doctor", "hospital", "lab", "pharmacy"], required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: { type: [InvoiceItemSchema], default: [] },
    totals: {
      subtotal: { type: Number, required: true },
      commissionPercentage: { type: Number, required: true },
      commissionAmount: { type: Number, required: true },
      netTotal: { type: Number, required: true },
    },
    paymentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    notes: { type: String },
    issuedAt: { type: Date, default: Date.now },
    // Admin-only soft delete: if true, hidden from admin lists but still available to providers
    deletedForAdmin: { type: Boolean, default: false, index: true },
    // Provider soft delete: if true, hidden from provider lists but still available to admin
    deletedForProvider: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Simple number generator: INV-YYYYMMDD-<rand4>
InvoiceSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const rnd = Math.floor(1000 + Math.random() * 9000);
    this.invoiceNumber = `INV-${ymd}-${rnd}`;
  }
  next();
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);
export default Invoice;
