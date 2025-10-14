// controllers/upload.controller.js
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import sharp from 'sharp';

function uploadStreamToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sehatkor', resource_type: 'auto', ...opts },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Function to compress image using Sharp
async function compressImage(buffer) {
  try {
    // Use Sharp to resize and compress the image
    const compressedBuffer = await sharp(buffer)
      .resize(1200, 1200, { // Resize to max 1200px on any side while maintaining aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality for good balance
      .toBuffer();

    return compressedBuffer;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

export const uploadImage = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: 'Cloudinary env vars are missing on the server' });
    }
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Only allow images, block videos and documents
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only images are allowed' });
    }

    // Check file size limit (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Please upload an image smaller than 5MB.'
      });
    }

    // Compress the image
    const compressedBuffer = await compressImage(file.buffer);

    const uploadOptions = {
      resource_type: 'image',
      format: 'jpg' // Ensure consistent format
    };

    const result = await uploadStreamToCloudinary(compressedBuffer, uploadOptions);

    return res.status(200).json({
      success: true,
      message: 'File uploaded and compressed successfully',
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      duration: result.duration,
      bytes: result.bytes,
      originalSize: file.size,
      compressedSize: compressedBuffer.length
    });

  } catch (err) {
    const msg = typeof err?.message === 'string' ? err.message : 'Error uploading file';
    console.error('Upload error:', err);

    // Handle multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Please upload an image smaller than 5MB.'
      });
    }

    res.status(500).json({ success: false, message: msg });
  }
};
