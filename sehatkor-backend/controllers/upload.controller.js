// controllers/upload.controller.js
import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'sehatkor', // Optional folder in Cloudinary
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Upload failed', error });
        }

        return res.status(200).json({
          success: true,
          message: 'File uploaded successfully',
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe the file buffer to the Cloudinary stream
    streamifier.createReadStream(file.buffer).pipe(result);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Error uploading image', error: err.message });
  }
};
