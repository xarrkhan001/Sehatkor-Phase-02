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
  approveProviderPendingWithdrawals,
  deleteWithdrawal,
  bulkDeleteWithdrawals,
  deleteAllWithdrawalsForProvider,
  hideProvider,
  unhideProvider,
  getInvoicesByProvider,
  getInvoiceById,
  getAllInvoices,
  deleteInvoice,
  bulkDeleteInvoices,
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

// Invoice routes
router.get('/invoices/provider/:providerId', getInvoicesByProvider);
router.get('/invoices/:invoiceId', getInvoiceById);
router.get('/invoices', getAllInvoices); // Admin: Get all invoices
router.delete('/invoices/:invoiceId', deleteInvoice); // Admin: Delete invoice
router.post('/invoices/bulk-delete', bulkDeleteInvoices); // Admin: Bulk delete invoices

// Admin utilities to remove 'pending' from DB
router.put('/withdrawals/approve-all', approveAllPendingWithdrawals);
router.put('/withdrawals/:providerId/approve-pending', approveProviderPendingWithdrawals);

// Deletion routes for withdrawals
router.delete('/withdrawals/:providerId/:withdrawalId', deleteWithdrawal);
router.post('/withdrawals/bulk-delete', bulkDeleteWithdrawals);
router.delete('/withdrawals/provider/:providerId', deleteAllWithdrawalsForProvider);

// Admin provider management routes
router.get('/providers-summary', getProvidersSummary);
router.post('/bulk-release/:providerId', bulkReleasePayments);
// Hide/unhide provider for providers summary (admin view only)
router.post('/providers/:providerId/hide', hideProvider);
router.delete('/providers/:providerId/hide', unhideProvider);

export default router;