import express from 'express';
import { 
  submitRegistrationNumber, 
  getMyVerificationStatus,
  getAllPendingVerifications,
  approveRegistrationVerification,
  rejectRegistrationVerification
} from '../controllers/verification.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Provider routes (authenticated users)
router.post('/submit-registration', authMiddleware, submitRegistrationNumber);
router.get('/my-status', authMiddleware, getMyVerificationStatus);

// Get notifications for current user
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find the most recent verification that was reviewed but not yet notified
    const verification = await RegistrationVerification.findOne({
      userId,
      status: { $in: ['approved', 'rejected'] },
      reviewedAt: { $exists: true },
      notificationSent: { $ne: true }
    }).sort({ reviewedAt: -1 });

    if (verification) {
      res.json({
        notification: {
          id: verification._id,
          type: verification.status,
          registrationNumber: verification.registrationNumber,
          adminNotes: verification.adminNotes,
          timestamp: verification.reviewedAt
        }
      });
    } else {
      res.json({ notification: null });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.post('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await RegistrationVerification.findOneAndUpdate(
      { _id: id, userId },
      { notificationSent: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Admin routes
router.get('/pending', authMiddleware, getAllPendingVerifications);
router.put('/:verificationId/approve', authMiddleware, approveRegistrationVerification);
router.put('/:verificationId/reject', authMiddleware, rejectRegistrationVerification);

export default router;
