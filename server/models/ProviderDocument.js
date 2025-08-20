import mongoose from 'mongoose';

const ProviderDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  url: { type: String, required: true },
  public_id: { type: String, required: true, unique: true },
  fileName: { type: String },
  fileSize: { type: Number },
  resourceType: { type: String, default: 'raw' },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  notes: { type: String },
}, { timestamps: true });

const ProviderDocument = mongoose.model('ProviderDocument', ProviderDocumentSchema);
export default ProviderDocument;
