import mongoose from 'mongoose';

const LastMessageSchema = new mongoose.Schema(
  {
    text: String,
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: { type: LastMessageSchema, default: undefined },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;


