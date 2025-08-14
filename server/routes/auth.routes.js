import express from 'express';
import { register, login, googleLogin, facebookStart, facebookCallback } from '../apis/index.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/facebook', facebookStart);
router.get('/facebook/callback', facebookCallback);

export default router;
