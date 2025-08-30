import mongoose from 'mongoose';

const HiddenProviderSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    reason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model('HiddenProvider', HiddenProviderSchema);
