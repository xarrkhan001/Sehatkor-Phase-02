import ConnectionRequest from '../models/ConnectionRequest.js';
import User from '../models/User.js';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.userId;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already pending' });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected with this user' });
      } else if (existingRequest.status === 'rejected') {
        await ConnectionRequest.findByIdAndDelete(existingRequest._id);
      }
    }

    const connectionRequest = new ConnectionRequest({
      sender: senderId,
      recipient: recipientId,
      message: message || ''
    });

    await connectionRequest.save();

    await connectionRequest.populate('sender', 'name email role avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(recipientId).emit('new_connection_request', {
        requestId: connectionRequest._id,
        sender: connectionRequest.sender,
        message: 'You have a new connection request'
      });
    }

    res.status(201).json({
      message: 'Connection request sent successfully',
      request: connectionRequest
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }
    res.status(500).json({ message: 'Error sending connection request', error: error.message });
  }
};

export const sendConnectionRequestWithMessage = async (req, res) => {
  try {
    const { recipientId, message, initialMessage, serviceName } = req.body;
    const senderId = req.userId;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Connection request already pending' });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: 'Already connected with this user' });
      } else if (existingRequest.status === 'rejected') {
        await ConnectionRequest.findByIdAndDelete(existingRequest._id);
      }
    }

    const connectionRequest = new ConnectionRequest({
      sender: senderId,
      recipient: recipientId,
      message: message || initialMessage || '',
      initialMessage: initialMessage || '',
      serviceName: serviceName || ''
    });

    await connectionRequest.save();

    await connectionRequest.populate('sender', 'name email role avatar');

    const io = req.app.get('io');
    if (io) {
      io.to(recipientId).emit('new_connection_request', {
        requestId: connectionRequest._id,
        sender: connectionRequest.sender,
        message: 'You have a new connection request',
        initialMessage: initialMessage,
        serviceName: serviceName
      });
    }

    res.status(201).json({
      message: 'Connection request sent successfully',
      request: connectionRequest
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }
    res.status(500).json({ message: 'Error sending connection request', error: error.message });
  }
};

// Get pending requests (received by current user)
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const pendingRequests = await ConnectionRequest.find({
      recipient: userId,
      status: 'pending'
    }).populate('sender', 'name email role avatar isVerified').lean();

    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Get sent requests (sent by current user)
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const sentRequests = await ConnectionRequest.find({
      sender: userId
    }).populate('recipient', 'name email role avatar isVerified')
      .sort({ createdAt: -1 }).lean();

    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent requests', error: error.message });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    request.status = 'accepted';
    await request.save();

    // Normalize duplicates between the same two users to avoid a pending ghost on the other side
    try {
      const A = request.sender.toString();
      const B = request.recipient.toString();
      // Delete any other requests between A and B that are not accepted (older pendings/rejects)
      await ConnectionRequest.deleteMany({
        _id: { $ne: request._id },
        $or: [
          { sender: A, recipient: B },
          { sender: B, recipient: A }
        ],
        status: { $ne: 'accepted' }
      });
    } catch {}

    // Emit socket event to both users to refresh their chat lists
    const io = req.app.get('io');
    if (io) {
      // Notify the sender that their request was accepted
      io.to(request.sender.toString()).emit('connection_accepted', {
        userId: userId,
        message: 'Your connection request was accepted'
      });
      
      // Notify the recipient (current user) as well
      io.to(userId).emit('connection_accepted', {
        userId: request.sender.toString(),
        message: 'Connection established'
      });
    }

    res.status(200).json({ message: 'Connection request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting request', error: error.message });
  }
};

// Reject connection request
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      recipient: userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Connection request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request', error: error.message });
  }
};

// Cancel pending connection request (for sender only)
export const cancelConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Find the pending request sent by current user
    const request = await ConnectionRequest.findOne({
      _id: requestId,
      sender: userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Pending request not found or you are not authorized to cancel it' });
    }

    // Delete the pending request
    await ConnectionRequest.findByIdAndDelete(requestId);

    // Emit socket event to recipient to update their received requests
    const io = req.app.get('io');
    if (io) {
      io.to(request.recipient.toString()).emit('connection_request_cancelled', {
        requestId: requestId,
        message: 'A connection request was cancelled'
      });
    }

    res.status(200).json({ message: 'Connection request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling request', error: error.message });
  }
};

// Delete connection request (for dismissing cards)
export const deleteConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Allow deletion if user is either sender or recipient
    const request = await ConnectionRequest.findOne({
      _id: requestId,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow deletion of rejected or accepted requests (not pending)
    if (request.status === 'pending') {
      return res.status(400).json({ message: 'Cannot delete pending requests' });
    }

    await ConnectionRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: 'Connection request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};

// Get connected users (mutual connections)
export const getConnectedUsers = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all accepted connections where user is either sender or recipient
    const connections = await ConnectionRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    }).populate('sender recipient', 'name email role avatar isVerified').lean();

    // Extract connected users (excluding current user) and dedupe by _id
    const seen = new Set();
    const connectedUsers = [];
    for (const conn of connections) {
      const otherUser = conn.sender._id.toString() === userId ? conn.recipient : conn.sender;
      const otherId = otherUser._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        connectedUsers.push(otherUser);
      }
    }

    res.status(200).json(connectedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching connected users', error: error.message });
  }
};

// Remove user connection (from chat)
export const removeUserConnection = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Find the accepted connection between the two users
    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId, status: 'accepted' },
        { sender: targetUserId, recipient: currentUserId, status: 'accepted' }
      ]
    });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Delete the connection
    await ConnectionRequest.findByIdAndDelete(connection._id);

    // Emit socket event to both users for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${currentUserId}`).emit('connection_removed', {
        userId: targetUserId,
        message: 'Connection removed successfully'
      });
      io.to(`user_${targetUserId}`).emit('connection_removed', {
        userId: currentUserId,
        message: 'A user removed your connection'
      });
    }

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: 'Error removing connection', error: error.message });
  }
};

// Search users for connection requests
export const searchUsersForConnection = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // First try exact matches
    let users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: `^${query}$`, $options: 'i' } },
        { email: { $regex: `^${query}$`, $options: 'i' } }
      ]
    }).select('name email role avatar isVerified').limit(1);

    // If no exact match found, try partial matches but limit to 1 result
    if (users.length === 0) {
      users = await User.find({
        _id: { $ne: userId },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).select('name email role avatar isVerified').limit(1);
    }

    // Get existing connection status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const connection = await ConnectionRequest.findOne({
          $or: [
            { sender: userId, recipient: user._id },
            { sender: user._id, recipient: userId }
          ]
        });

        return {
          ...user.toObject(),
          connectionStatus: connection ? connection.status : 'none'
        };
      })
    );

    res.status(200).json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};
