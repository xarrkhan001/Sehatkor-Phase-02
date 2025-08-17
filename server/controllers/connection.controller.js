import ConnectionRequest from '../models/ConnectionRequest.js';
import User from '../models/User.js';

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.userId;

    // Check if recipient exists and is verified
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!recipient.isVerified) {
      return res.status(400).json({ message: 'Can only send requests to verified users' });
    }

    // Check if sender is verified
    const sender = await User.findById(senderId);
    if (!sender.isVerified) {
      return res.status(400).json({ message: 'You must be verified to send connection requests' });
    }

    // Check if request already exists
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
        // Allow resending after rejection - delete the old rejected request
        await ConnectionRequest.findByIdAndDelete(existingRequest._id);
      }
    }

    // Create new request
    const connectionRequest = new ConnectionRequest({
      sender: senderId,
      recipient: recipientId,
      message: message || ''
    });

    await connectionRequest.save();

    // Populate sender details for response
    await connectionRequest.populate('sender', 'name email role avatar');

    // Emit socket event to recipient about new connection request
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

// Get pending requests (received by current user)
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const pendingRequests = await ConnectionRequest.find({
      recipient: userId,
      status: 'pending'
    }).populate('sender', 'name email role avatar isVerified');

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
      .sort({ createdAt: -1 });

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
    }).populate('sender recipient', 'name email role avatar isVerified');

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
      isVerified: true,
      $or: [
        { name: { $regex: `^${query}$`, $options: 'i' } },
        { email: { $regex: `^${query}$`, $options: 'i' } }
      ]
    }).select('name email role avatar isVerified').limit(1);

    // If no exact match found, try partial matches but limit to 1 result
    if (users.length === 0) {
      users = await User.find({
        _id: { $ne: userId },
        isVerified: true,
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
