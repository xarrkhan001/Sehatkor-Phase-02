import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    serviceType: { 
      type: String, 
      required: true, 
      enum: ['doctor', 'clinic', 'laboratory', 'pharmacy'],
      index: true 
    },
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    providerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    review: { type: String, trim: true },
    patientName: { type: String, required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate ratings
RatingSchema.index({ serviceId: 1, patientId: 1 }, { unique: true });
RatingSchema.index({ providerId: 1, createdAt: -1 });
RatingSchema.index({ serviceType: 1, rating: -1 });

const Rating = mongoose.model('Rating', RatingSchema);
export default Rating;
