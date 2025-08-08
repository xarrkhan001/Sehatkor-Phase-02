// middlewares/upload.middleware.js
import multer from 'multer';

// Store file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export default upload;
