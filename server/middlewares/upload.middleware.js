// middlewares/upload.middleware.js
import multer from 'multer';

// Store file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  // Images only
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
]);

const upload = multer({
  storage,
  limits: {
    // Limit to 5MB as requested
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

export default upload;
