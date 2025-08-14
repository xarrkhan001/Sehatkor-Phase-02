// routes/upload.routes.js
import express from 'express';
import upload from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = express.Router();

// Only authenticated users can upload
router.post('/upload', authMiddleware, upload.single('file'), uploadImage);

export default router;
