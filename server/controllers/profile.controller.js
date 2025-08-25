// controllers/profile.controller.js
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

function uploadStreamToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'sehatkor/profiles', resource_type: 'image', ...opts },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const uploadProfileImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      userId: req.userId,
      hasFile: !!req.file,
      headers: req.headers.authorization ? 'Present' : 'Missing'
    });

    const userId = req.userId; // Changed from req.user.id to req.userId
    const file = req.file;

    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Only allow images
    if (!file.mimetype.startsWith('image/')) {
      console.log('Invalid file type:', file.mimetype);
      return res.status(400).json({ success: false, message: 'Only images are allowed' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found:', user.name);

    // Delete old profile image from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`sehatkor/profiles/${publicId}`);
      } catch (error) {
        console.log('Error deleting old profile image:', error);
      }
    }

    // Upload new image to Cloudinary (full size, no transformation)
    const uploadOptions = { resource_type: 'image' };
    const result = await uploadStreamToCloudinary(file.buffer, uploadOptions);

    // Update user avatar
    user.avatar = result.secure_url;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      avatar: result.secure_url,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error('Profile image upload error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading profile image',
      error: err.message 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user.id to req.userId
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // Changed from req.user.id to req.userId
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.resetPasswordToken;
    delete updates.resetPasswordExpire;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};
