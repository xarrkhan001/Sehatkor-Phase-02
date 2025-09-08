// routes/profile.routes.js
import express from 'express';
import multer from 'multer';
import { uploadProfileImage, getProfile, updateProfile, removeProfileImage } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Profile routes
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.post('/upload-image', authMiddleware, upload.single('image'), uploadProfileImage);
router.delete('/image', authMiddleware, removeProfileImage);

export default router;
