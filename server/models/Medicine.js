import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    category: { type: String, default: 'Other' },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    googleMapLink: { type: String },
    city: { type: String },
    detailAddress: { type: String },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    providerName: { type: String, required: true },
    providerType: { type: String, enum: ['pharmacy'], default: 'pharmacy' },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MedicineSchema.index({ providerId: 1, createdAt: -1 });

const Medicine = mongoose.model('Medicine', MedicineSchema);
export default Medicine;


