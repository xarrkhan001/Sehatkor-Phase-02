import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    text: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    // For reply/quote support
    replyToId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null, index: true },
    readAt: { type: Date, default: null },
    // Soft delete for specific users (per-recipient/per-sender visibility)
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

MessageSchema.index({ createdAt: 1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;





