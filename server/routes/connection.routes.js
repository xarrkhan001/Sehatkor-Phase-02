import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { 
  sendConnectionRequest, 
  sendConnectionRequestWithMessage,
  getPendingRequests, 
  getSentRequests,
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  cancelConnectionRequest,
  deleteConnectionRequest,
  getConnectedUsers,
  removeUserConnection,
  searchUsersForConnection 
} from '../controllers/connection.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send connection request
router.post('/request', sendConnectionRequest);

// Send connection request with initial message
router.post('/request-with-message', sendConnectionRequestWithMessage);

// Get pending requests (received by current user)
router.get('/pending', getPendingRequests);

// Get sent requests (sent by current user)
router.get('/sent', getSentRequests);

// Accept connection request
router.put('/accept/:requestId', acceptConnectionRequest);

// Reject connection request
router.put('/reject/:requestId', rejectConnectionRequest);

// Cancel pending connection request (for sender only)
router.delete('/cancel/:requestId', cancelConnectionRequest);

// Delete connection request
router.delete('/delete/:requestId', deleteConnectionRequest);

// Get connected users
router.get('/connected', getConnectedUsers);

// Remove user connection (from chat)
router.delete('/remove-connection/:userId', removeUserConnection);

// Search users for connections
router.get('/search', searchUsersForConnection);

export default router;
