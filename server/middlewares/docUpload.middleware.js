// middlewares/docUpload.middleware.js
import multer from 'multer';

// Store file in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const uploadDoc = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB cap
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Only PDF/DOC/DOCX files are allowed'));
    }
    cb(null, true);
  }
});

export default uploadDoc;
