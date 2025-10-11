import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import ConnectionRequest from '../models/ConnectionRequest.js';
import mongoose from 'mongoose';
import { getUserSocketIds } from '../services/chat.service.js';

export const getVerifiedUsers = async (req, res) => {
  try {
    const currentUserId = req.userId;
    
    // Get connected users (mutual connections)
    const connections = await ConnectionRequest.find({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { recipient: currentUserId, status: 'accepted' }
      ]
    }).populate('sender recipient', '_id name email role avatar isVerified').lean();

    // Extract connected users (excluding current user)
    const connectedUsers = connections.map(conn => {
      const otherUser = conn.sender._id.toString() === currentUserId ? conn.recipient : conn.sender;
      return otherUser;
    });

    res.status(200).json(connectedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verified users', error: error.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'recipientId is required' });

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    });
    let created = false;
    if (!conversation) {
      conversation = await Conversation.create({ participants: [currentUserId, recipientId], status: 'active' });
      created = true;
    }
    res.status(200).json(conversation);
    // No invitation events
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const conversations = await Conversation.find({ participants: currentUserId })
      .sort({ updatedAt: -1 })
      .populate('participants', '_id name email role avatar isVerified')
      .lean();

    // Attach unread counts for the current user
    const withUnread = await Promise.all(
      conversations.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          recipient: currentUserId,
          readAt: null,
        });
        return { ...c, unreadCount };
      })
    );

    res.status(200).json(withUnread);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.userId;
    const messages = await Message.find({ conversationId, deletedFor: { $ne: currentUserId } }).sort({ createdAt: 1 }).lean();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

export const markConversationRead = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ message: 'conversationId is required' });
    const result = await Message.updateMany(
      { conversationId, recipient: currentUserId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.status(200).json({ success: true, updated: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { conversationId, recipientId, type, text, fileUrl, fileName, fileSize, replyToId } = req.body;
    if (!conversationId || !recipientId) {
      return res.status(400).json({ message: 'conversationId and recipientId are required' });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const allowedTypes = new Set(['text', 'image']);
    const normalizedType = type || 'text';
    if (!allowedTypes.has(normalizedType)) {
      return res.status(400).json({ message: 'Unsupported message type' });
    }
    const message = await Message.create({
      conversationId,
      sender: senderId,
      recipient: recipientId,
      type: normalizedType,
      text,
      fileUrl,
      fileName,
      fileSize,
      replyToId: replyToId || null,
    });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: normalizedType === 'text' ? text : fileName || normalizedType,
        type: normalizedType,
        sender: senderId,
        createdAt: new Date(),
      },
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { messageId } = req.params;
    const scope = (req.query.scope || 'me').toString();
    if (!messageId) return res.status(400).json({ message: 'messageId is required' });
    // Be idempotent: if invalid id or not found, respond success so UI can proceed
    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(200).json({ success: true, scope });
    }
    const message = await Message.findById(messageId);
    if (!message) return res.status(200).json({ success: true, scope });
    const conversationId = String(message.conversationId);

    if (scope === 'everyone') {
      // Only sender can delete for everyone
      if (String(message.sender) !== String(currentUserId)) {
        return res.status(403).json({ message: 'Only sender can delete for everyone' });
      }
      await Message.deleteOne({ _id: messageId });
      try {
        const io = req.app.get('io');
        if (io) io.to(conversationId).emit('message_deleted', { messageId, conversationId });
      } catch {}
      return res.status(200).json({ success: true, scope: 'everyone' });
    } else {
      // Delete for me: hide for current user only
      if (!message.deletedFor) message.deletedFor = [];
      const already = message.deletedFor.some((u) => String(u) === String(currentUserId));
      if (!already) {
        message.deletedFor.push(currentUserId);
        await message.save();
      }
      // Do not emit global event; only the requester needs to remove locally
      return res.status(200).json({ success: true, scope: 'me' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

// acceptConversation / rejectConversation endpoints removed (invitation flow disabled)


export const clearConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.params;
    if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: 'Valid conversationId is required' });
    }
    const conv = await Conversation.findById(conversationId).select('_id participants');
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const isParticipant = conv.participants.some((p) => String(p) === String(currentUserId));
    if (!isParticipant) return res.status(403).json({ message: 'Not a participant' });

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndUpdate(conversationId, { $unset: { lastMessage: 1 } });

    try {
      const io = req.app.get('io');
      if (io) {
        const roomId = String(conversationId);
        io.to(roomId).emit('conversation_cleared', { conversationId: roomId, by: currentUserId });
        // Also notify all participant sockets that might not be in the room
        for (const participantId of conv.participants) {
          const ids = getUserSocketIds(String(participantId)) || [];
          for (const sid of ids) {
            const s = io.sockets.sockets.get(sid);
            if (s && !s.rooms.has(roomId)) {
              s.emit('conversation_cleared', { conversationId: roomId, by: currentUserId });
            }
          }
        }
      }
    } catch {}

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing conversation', error: error.message });
  }
};


