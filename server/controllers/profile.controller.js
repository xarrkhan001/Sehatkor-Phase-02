// controllers/profile.controller.js
import User from '../models/User.js';
import DoctorService from '../models/DoctorService.js';
import ClinicService from '../models/ClinicService.js';
import Medicine from '../models/Medicine.js';
import LaboratoryTest from '../models/LaboratoryTest.js';
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
    const userId = req.userId; // Changed from req.user.id to req.userId
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Only allow images
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Only images are allowed' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old profile image from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`sehatkor/profiles/${publicId}`);
      } catch (error) {
        // Silently handle deletion error
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

    // Keep the previous user doc to compare name changes
    const before = await User.findById(userId).select('name');
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If the provider's name changed, propagate to all their services
    try {
      const prevName = before?.name?.toString?.() || '';
      const nextName = user?.name?.toString?.() || '';
      if (prevName && nextName && prevName !== nextName) {
        await Promise.all([
          DoctorService.updateMany({ providerId: userId }, { $set: { providerName: nextName } }),
          ClinicService.updateMany({ providerId: userId }, { $set: { providerName: nextName } }),
          Medicine.updateMany({ providerId: userId }, { $set: { providerName: nextName } }),
          LaboratoryTest.updateMany({ providerId: userId }, { $set: { providerName: nextName } }),
        ]);
      }
    } catch (e) {
      // Do not fail the request if propagation fails; log for diagnostics
      console.error('Service providerName propagation failed:', e?.message || e);
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

// Remove current profile image and clear avatar field
export const removeProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If avatar exists and is a Cloudinary URL, attempt to delete it
    if (user.avatar) {
      try {
        if (user.avatar.includes('res.cloudinary.com') || user.avatar.includes('cloudinary')) {
          const publicId = user.avatar.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`sehatkor/profiles/${publicId}`);
        }
      } catch (e) {
        // Log but do not fail removal because of Cloudinary issues
        console.warn('Cloudinary delete failed:', e?.message || e);
      }
    }

    user.avatar = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image removed successfully',
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
    console.error('Remove profile image error:', err);
    res.status(500).json({ success: false, message: 'Error removing profile image', error: err.message });
  }
};
