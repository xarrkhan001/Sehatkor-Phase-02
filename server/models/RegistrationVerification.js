import mongoose from 'mongoose';

const RegistrationVerificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  registrationNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  providerType: { 
    type: String, 
    enum: ['doctor', 'clinic/hospital', 'laboratory', 'pharmacy'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'superseded'], 
    default: 'pending', 
    index: true 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  // Store provider details at time of submission for reference
  providerName: String,
  providerEmail: String,
  providerPhone: String,
}, { timestamps: true });

// Compound index to prevent duplicate pending requests from same user
RegistrationVerificationSchema.index({ userId: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'pending' } 
});

const RegistrationVerification = mongoose.model('RegistrationVerification', RegistrationVerificationSchema);
export default RegistrationVerification;
