// controllers/upload.controller.js
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

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
    const uploadOptions = { resource_type: 'image' };

    const result = await uploadStreamToCloudinary(file.buffer, uploadOptions);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      duration: result.duration,
      bytes: result.bytes,
    });

  } catch (err) {
    const msg = typeof err?.message === 'string' ? err.message : 'Error uploading file';
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: msg });
  }
};
