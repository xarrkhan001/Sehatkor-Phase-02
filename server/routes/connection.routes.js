import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { 
  sendConnectionRequest, 
  getPendingRequests, 
  getSentRequests,
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  deleteConnectionRequest,
  getConnectedUsers,
  searchUsersForConnection 
} from '../controllers/connection.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send connection request
router.post('/request', sendConnectionRequest);

// Get pending requests (received by current user)
router.get('/pending', getPendingRequests);

// Get sent requests (sent by current user)
router.get('/sent', getSentRequests);

// Accept connection request
router.put('/accept/:requestId', acceptConnectionRequest);

// Reject connection request
router.put('/reject/:requestId', rejectConnectionRequest);

// Delete connection request
router.delete('/delete/:requestId', deleteConnectionRequest);

// Get connected users
router.get('/connected', getConnectedUsers);

// Search users for connections
router.get('/search', searchUsersForConnection);

export default router;
