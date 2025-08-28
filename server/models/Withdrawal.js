import mongoose from 'mongoose';

const WithdrawalSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['easypaisa', 'jazzcash'],
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'rejected'],
      // Default to 'approved' so new withdrawals are considered processed immediately
      default: 'approved',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Withdrawal', WithdrawalSchema);
