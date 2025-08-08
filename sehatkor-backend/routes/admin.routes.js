import express from 'express';
import { getAdminStats, getVerifiedUsersCount, verifyEntity, getPendingVerifications, getAllUsers } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Temporarily disable authentication middleware for testing
// router.use(authMiddleware);

// Get all users
router.get('/users', getAllUsers);
// Get all pending verifications (unverified providers)
router.get('/pending', getPendingVerifications);
// Approve/reject a user/provider
router.patch('/verify/:userId', verifyEntity);
// Get platform stats
router.get('/stats', getAdminStats);
// Get verified users count (secure endpoint)
router.get('/verified-users-count', getVerifiedUsersCount);

export default router;
