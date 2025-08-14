import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { 
  sendConnectionRequest, 
  getPendingRequests, 
  acceptConnectionRequest, 
  rejectConnectionRequest, 
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

// Accept connection request
router.put('/accept/:requestId', acceptConnectionRequest);

// Reject connection request
router.put('/reject/:requestId', rejectConnectionRequest);

// Get connected users (mutual connections)
router.get('/connected', getConnectedUsers);

// Search users for connection
router.get('/search', searchUsersForConnection);

export default router;
