import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentsByPatient,
  getPaymentsByProvider,
  markServiceCompleted,
  releasePaymentToProvider,
  getPendingReleasePayments,
  getPaymentStats
} from '../controllers/payment.controller.js';

const router = express.Router();

// Payment management routes
router.post('/', createPayment);
router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/pending-release', getPendingReleasePayments);
router.get('/patient/:patientId', getPaymentsByPatient);
router.get('/provider/:providerId', getPaymentsByProvider);

// Service completion and payment release
router.put('/:paymentId/complete', markServiceCompleted);
router.put('/:paymentId/release', releasePaymentToProvider);

export default router;