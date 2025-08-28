import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentsByPatient,
  getPaymentsByProvider,
  markServiceCompleted,
  releasePaymentToProvider,
  getPendingReleasePayments,
  getPaymentStats,
  getProviderWallet,
  requestWithdrawal,
  getProvidersSummary,
  bulkReleasePayments,
  getWithdrawalsByProvider,
  approveAllPendingWithdrawals,
  approveProviderPendingWithdrawals
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

// Provider wallet routes
router.get('/wallet/:providerId', getProviderWallet);
router.post('/withdraw/:providerId', requestWithdrawal);
router.get('/withdrawals/:providerId', getWithdrawalsByProvider);
// Admin utilities to remove 'pending' from DB
router.put('/withdrawals/approve-all', approveAllPendingWithdrawals);
router.put('/withdrawals/:providerId/approve-pending', approveProviderPendingWithdrawals);

// Admin provider management routes
router.get('/providers-summary', getProvidersSummary);
router.post('/bulk-release/:providerId', bulkReleasePayments);

export default router;