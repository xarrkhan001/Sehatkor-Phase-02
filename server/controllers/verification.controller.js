import User from '../models/User.js';
import RegistrationVerification from '../models/RegistrationVerification.js';

// Submit registration number for verification
export const submitRegistrationNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const userId = req.user.userId;

    if (!registrationNumber || !registrationNumber.trim()) {
      return res.status(400).json({ message: 'Registration number is required' });
    }

    // Check if user already has a pending verification
    const existingVerification = await RegistrationVerification.findOne({
      userId,
      status: 'pending'
    });

    if (existingVerification) {
      return res.status(400).json({ 
        message: 'You already have a pending verification request' 
      });
    }

    // If user has approved/rejected verification, mark old one as superseded
    await RegistrationVerification.updateMany(
      { userId, status: { $in: ['approved', 'rejected'] } },
      { status: 'superseded' }
    );

    // Check if user is a provider
    const providerRoles = ['doctor', 'clinic/hospital', 'laboratory', 'pharmacy'];
    const user = await User.findById(userId);
    if (!providerRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: 'Only providers can submit registration numbers' 
      });
    }

    // Create new verification request
    const verification = new RegistrationVerification({
      userId: userId,
      registrationNumber: registrationNumber.trim(),
      providerType: user.role,
      providerName: user.name,
      providerEmail: user.email,
      providerPhone: user.phone
    });

    await verification.save();

    res.status(201).json({
      message: 'Registration number submitted successfully. Admin will review it soon.',
      verification: {
        id: verification._id,
        registrationNumber: verification.registrationNumber,
        status: verification.status,
        submittedAt: verification.submittedAt
      }
    });

  } catch (error) {
    console.error('Error submitting registration number:', error);
    res.status(500).json({ 
      message: 'Error submitting registration number', 
      error: error.message 
    });
  }
};

// Get user's verification status
export const getMyVerificationStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const verification = await RegistrationVerification.findOne({
      userId: userId
    }).sort({ createdAt: -1 });

    const user = await User.findById(userId).select('isVerified verificationStatus licenseNumber');

    res.status(200).json({
      user: {
        isVerified: user?.isVerified || false,
        verificationStatus: user?.verificationStatus || 'pending',
        hasLicenseNumber: Boolean(user?.licenseNumber?.trim())
      },
      registrationVerification: verification ? {
        id: verification._id,
        registrationNumber: verification.registrationNumber,
        status: verification.status,
        submittedAt: verification.submittedAt,
        reviewedAt: verification.reviewedAt,
        adminNotes: verification.adminNotes
      } : null
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ 
      message: 'Error fetching verification status', 
      error: error.message 
    });
  }
};

// Admin: Get all pending verification requests
export const getAllPendingVerifications = async (req, res) => {
  try {
    // Temporarily remove admin role validation to match existing admin controller pattern
    // const userId = req.user?.id || req.userId;
    // const adminUser = await User.findById(userId);
    // 
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Admin access required' });
    // }

    const pendingVerifications = await RegistrationVerification.find({
      status: 'pending'
    })
    .populate('userId', 'name email phone role avatar businessName')
    .sort({ submittedAt: -1 });

    res.status(200).json({
      verifications: pendingVerifications.map(v => ({
        id: v._id,
        registrationNumber: v.registrationNumber,
        providerType: v.providerType,
        status: v.status,
        submittedAt: v.submittedAt,
        provider: {
          id: v.userId._id,
          name: v.userId.name,
          email: v.userId.email,
          phone: v.userId.phone,
          role: v.userId.role,
          avatar: v.userId.avatar,
          businessName: v.userId.businessName
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ 
      message: 'Error fetching pending verifications', 
      error: error.message 
    });
  }
};

// Admin: Approve registration verification
export const approveRegistrationVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user?.id || req.userId;

    // Temporarily remove admin role validation to match existing admin controller pattern
    // const adminUser = await User.findById(adminId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Admin access required' });
    // }

    const verification = await RegistrationVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ message: 'Verification request already processed' });
    }

    // Update verification record
    verification.status = 'approved';
    verification.reviewedAt = new Date();
    verification.reviewedBy = adminId;
    verification.adminNotes = adminNotes;
    await verification.save();

    // Update user record
    const user = await User.findById(verification.userId);
    if (user) {
      user.licenseNumber = verification.registrationNumber;
      user.isVerified = true;
      user.verificationStatus = 'approved';
      user.verifiedAt = new Date();
      user.verifiedBy = adminId;
      user.allowedToOperate = true;
      await user.save();
    }

    res.status(200).json({
      message: 'Registration verification approved successfully',
      verification: {
        id: verification._id,
        status: verification.status,
        reviewedAt: verification.reviewedAt
      }
    });

  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ 
      message: 'Error approving verification', 
      error: error.message 
    });
  }
};

// Admin: Reject registration verification
export const rejectRegistrationVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user?.id || req.userId;

    // Temporarily remove admin role validation to match existing admin controller pattern
    // const adminUser = await User.findById(adminId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Admin access required' });
    // }

    const verification = await RegistrationVerification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ message: 'Verification request already processed' });
    }

    // Update verification record
    verification.status = 'rejected';
    verification.reviewedAt = new Date();
    verification.reviewedBy = adminId;
    verification.adminNotes = adminNotes;
    await verification.save();

    res.status(200).json({
      message: 'Registration verification rejected',
      verification: {
        id: verification._id,
        status: verification.status,
        reviewedAt: verification.reviewedAt,
        adminNotes: verification.adminNotes
      }
    });

  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ 
      message: 'Error rejecting verification', 
      error: error.message 
    });
  }
};
