import express from 'express';
import { register, login, googleLogin, facebookStart, facebookCallback } from '../apis/index.js';
import { forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/facebook', facebookStart);
router.get('/facebook/callback', facebookCallback);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
