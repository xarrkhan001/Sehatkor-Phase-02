import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/me', getUserProfile);
router.put('/me', updateUserProfile);

export default router;


