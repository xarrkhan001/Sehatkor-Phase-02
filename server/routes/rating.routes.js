import express from 'express';
import { addRating, getServiceRatings, getProviderRatings, deleteRating } from '../controllers/rating.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Test endpoint to verify routing
router.get('/test', (req, res) => {
  res.json({ message: 'Rating routes working', timestamp: new Date().toISOString() });
});

// Add or update rating (requires authentication)
router.post('/add', authMiddleware, addRating);

// Get ratings for a specific service
router.get('/service/:serviceId', getServiceRatings);

// Get ratings for a provider
router.get('/provider/:providerId', getProviderRatings);

// Delete rating (requires authentication)
router.delete('/:ratingId', authMiddleware, deleteRating);

export default router;
