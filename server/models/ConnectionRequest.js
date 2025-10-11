import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  initialMessage: {
    type: String,
    default: ''
  },
  serviceName: {
    type: String,
    default: ''
  },
  serviceId: {
    type: String,
    default: ''
  },
  serviceLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique sender-recipient pairs
connectionRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

// Update the updatedAt field
connectionRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

export default ConnectionRequest;
