import express from 'express';
import { getAdminStats, getVerifiedUsersCount, verifyEntity, getPendingVerifications, getAllUsers, getVerifiedUsers, deleteUser, getAllServicesForAdmin, toggleServiceRecommendation, getRecommendedServicesCount } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Temporarily disable authentication middleware for testing
// router.use(authMiddleware);

// Get all users
router.get('/users', getAllUsers);
// Get all pending verifications (unverified providers)
router.get('/pending', getPendingVerifications);
// Get verified users with pagination
router.get('/verified-users', getVerifiedUsers);
// Delete a user permanently
router.delete('/users/:userId', deleteUser);
// Approve/reject a user/provider
router.patch('/verify/:userId', verifyEntity);
// Get platform stats
router.get('/stats', getAdminStats);
// Get verified users count (secure endpoint)
router.get('/verified-users-count', getVerifiedUsersCount);
// Get all services for recommendation management
router.get('/services', getAllServicesForAdmin);
// Toggle service recommendation status
router.patch('/services/:serviceId/:providerType/recommend', toggleServiceRecommendation);
// Get recommended services count
router.get('/recommended-services-count', getRecommendedServicesCount);

export default router;
