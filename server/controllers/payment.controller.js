import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";
import mongoose from "mongoose";
import HiddenProvider from "../models/HiddenProvider.js";
import Invoice from "../models/Invoice.js";

// Create payment record when booking is made
export const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      patientId,
      patientName,
      patientContact,
      providerId,
      providerName,
      providerType,
      serviceId,
      serviceName,
      amount,
      paymentMethod,
      paymentNumber,
      metadata = {}
    } = req.body;

    // Generate dummy transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      bookingId,
      patientId,
      patientName,
      patientContact,
      providerId,
      providerName,
      providerType,
      serviceId,
      serviceName,
      amount,
      paymentMethod,
      paymentNumber,
      transactionId,
      metadata
    });

    res.status(201).json({
      success: true,
      payment,
      message: "Payment recorded successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: error.message
    });
  }
};

// Bulk delete invoices (admin) -> soft delete for admin only
export const bulkDeleteInvoices = async (req, res) => {
  try {
    const { invoiceIds } = req.body || {};
    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ success: false, message: 'invoiceIds (array) is required' });
    }

    const validIds = invoiceIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid invoiceIds provided' });
    }

    const resUpdate = await Invoice.updateMany(
      { _id: { $in: validIds } },
      {
        $set: {
          deletedForAdmin: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id ? (mongoose.Types.ObjectId.isValid(req.user.id) ? new mongoose.Types.ObjectId(req.user.id) : undefined) : undefined,
        }
      }
    );

    return res.json({ success: true, message: 'Invoices deleted for admin', matched: resUpdate.matchedCount ?? resUpdate.nMatched, modified: resUpdate.modifiedCount ?? resUpdate.nModified, invoiceIds: validIds });
  } catch (error) {
    console.error(' Bulk delete invoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to bulk delete invoices', error: error.message });
  }
};

// Fetch invoices
export const getInvoicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const invoices = await Invoice.find({ providerId }).sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error(' Get invoice by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Admin: Get all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 50, provider, startDate, endDate } = req.query;
    
    let filter = {};
    
    // Filter by provider if specified
    if (provider) {
      filter.providerId = provider;
    }
    // Exclude invoices soft-deleted for admin
    filter.deletedForAdmin = { $ne: true };
    
    // Filter by date range if specified
    if (startDate || endDate) {
      filter.issuedAt = {};
      if (startDate) filter.issuedAt.$gte = new Date(startDate);
      if (endDate) filter.issuedAt.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(filter)
      .sort({ issuedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(' Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Delete an invoice by ID (admin) -> soft delete for admin only
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'invoiceId is required' });
    }
    const deleted = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        $set: {
          deletedForAdmin: true,
          deletedAt: new Date(),
          deletedBy: req.user?.id ? (mongoose.Types.ObjectId.isValid(req.user.id) ? new mongoose.Types.ObjectId(req.user.id) : undefined) : undefined,
        }
      },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    return res.json({ success: true, message: 'Invoice deleted for admin', invoiceId });
  } catch (error) {
    console.error(' Delete invoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete invoice', error: error.message });
  }
};

// Approve all pending withdrawals (admin utility)
export const approveAllPendingWithdrawals = async (req, res) => {
  try {
    const result = await Withdrawal.updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );

    return res.json({
      success: true,
      message: 'All pending withdrawals set to approved',
      matched: result.matchedCount ?? result.nMatched,
      modified: result.modifiedCount ?? result.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve pending withdrawals',
      error: error.message,
    });
  }
};

// Approve pending withdrawals for a given provider
export const approveProviderPendingWithdrawals = async (req, res) => {
  try {
    const { providerId } = req.params;
    const result = await Withdrawal.updateMany(
      { providerId, status: 'pending' },
      { $set: { status: 'approved' } }
    );

    return res.json({
      success: true,
      message: 'Provider pending withdrawals set to approved',
      providerId,
      matched: result.matchedCount ?? result.nMatched,
      modified: result.modifiedCount ?? result.nModified,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve provider pending withdrawals',
      error: error.message,
    });
  }
};

// Get all payment records for admin
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, providerType } = req.query;
    
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (providerType) filter.providerType = providerType;

    const payments = await Payment.find(filter)
      .populate('patientId', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

// Get payments by patient
export const getPaymentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const payments = await Payment.find({ patientId })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient payments",
      error: error.message
    });
  }
};

// Get payments by provider
export const getPaymentsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const payments = await Payment.find({ providerId })
      .populate('patientId', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider payments",
      error: error.message
    });
  }
};

// Get withdrawals by provider
export const getWithdrawalsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const withdrawals = await Withdrawal.find({ providerId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      withdrawals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals',
      error: error.message
    });
  }
};

// Delete a single withdrawal for a provider
export const deleteWithdrawal = async (req, res) => {
  try {
    const { providerId, withdrawalId } = req.params;
    if (!providerId || !withdrawalId) {
      return res.status(400).json({ success: false, message: 'providerId and withdrawalId are required' });
    }

    const filter = { _id: withdrawalId };
    try {
      // If providerId looks like ObjectId, cast; otherwise rely on schema casting or string compare
      filter.providerId = mongoose.Types.ObjectId.isValid(providerId)
        ? new mongoose.Types.ObjectId(providerId)
        : providerId;
    } catch {
      filter.providerId = providerId;
    }

    const deleted = await Withdrawal.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found for this provider' });
    }
    return res.json({ success: true, message: 'Withdrawal deleted', withdrawalId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete withdrawal', error: error.message });
  }
};

// Bulk delete withdrawals for a provider
export const bulkDeleteWithdrawals = async (req, res) => {
  try {
    const { providerId, ids } = req.body || {};
    if (!providerId || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'providerId and non-empty ids array are required' });
    }

    const filter = {
      _id: { $in: ids },
      providerId: mongoose.Types.ObjectId.isValid(providerId)
        ? new mongoose.Types.ObjectId(providerId)
        : providerId,
    };
    const result = await Withdrawal.deleteMany(filter);
    return res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to bulk delete withdrawals', error: error.message });
  }
};

// Delete all withdrawals for a provider
export const deleteAllWithdrawalsForProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'providerId is required' });
    }
    const filter = {
      providerId: mongoose.Types.ObjectId.isValid(providerId)
        ? new mongoose.Types.ObjectId(providerId)
        : providerId,
    };
    const result = await Withdrawal.deleteMany(filter);
    return res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete all withdrawals', error: error.message });
  }
};

// Mark service as completed (triggers payment release eligibility)
export const markServiceCompleted = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        serviceCompleted: true,
        completionDate: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    // Also update booking status
    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "Completed"
    });

    res.json({
      success: true,
      payment,
      message: "Service marked as completed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark service as completed",
      error: error.message
    });
  }
};

// Admin: Release payment to provider
export const releasePaymentToProvider = async (req, res) => {
  try {
    console.log('💰 Processing payment release request...');
    const { paymentId } = req.params;
    const { adminId, releaseNotes = "", adminCommission } = req.body;
    
    console.log('📋 Payment ID:', paymentId);
    console.log('👤 Admin ID:', adminId);

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      console.log('❌ Payment not found:', paymentId);
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    console.log('📄 Payment found:', payment._id, 'Service completed:', payment.serviceCompleted);

    if (!payment.serviceCompleted) {
      console.log('⚠️ Service not completed yet');
      return res.status(400).json({
        success: false,
        message: "Cannot release payment - service not completed yet"
      });
    }

    if (payment.releasedToProvider) {
      console.log('⚠️ Payment already released');
      return res.status(400).json({
        success: false,
        message: "Payment already released to provider"
      });
    }

    // Handle adminId - if it's not a valid ObjectId, set to null
    let validAdminId = null;
    if (adminId && adminId !== 'admin-user') {
      try {
        validAdminId = new mongoose.Types.ObjectId(adminId);
      } catch (err) {
        console.log('⚠️ Invalid adminId, setting to null:', adminId);
        validAdminId = null;
      }
    }

    console.log('🔄 Updating payment with valid adminId:', validAdminId);

    // Compute commission and net amounts (optional)
    const commissionPct = !isNaN(Number(adminCommission)) ? Number(adminCommission) : (payment.adminCommission ?? 0);
    const originalAmount = payment.originalAmount ?? payment.amount;
    const commissionAmount = Math.round((originalAmount * commissionPct) * 100) / 10000; // wrong scale if double *100; fix below
    // Correct commission calculation with precision
    const commission = Math.round((originalAmount * commissionPct) ) / 100; // PKR assumed, 2 decimals later
    const netAmount = Math.max(0, Math.round((originalAmount - commission) * 100) / 100);

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        releasedToProvider: true,
        releaseDate: new Date(),
        releasedBy: validAdminId,
        releaseNotes,
        paymentStatus: "released",
        originalAmount,
        adminCommission: commissionPct,
        adminCommissionAmount: commission,
        netReleaseAmount: netAmount,
        amount: netAmount,
      },
      { new: true }
    ).populate('patientId', 'name email phone');


    console.log('✅ Payment released successfully:', updatedPayment._id);

    // Create invoice document for this single release
    let invoiceDoc = null;
    try {
      invoiceDoc = await Invoice.create({
        providerId: payment.providerId,
        providerName: payment.providerName,
        providerType: payment.providerType,
        issuedBy: validAdminId || undefined,
        items: [
          {
            paymentId: payment._id,
            serviceId: payment.serviceId,
            serviceName: payment.serviceName,
            patientName: payment.patientName,
            originalAmount: originalAmount,
            adminCommissionAmount: commission,
            netAmount: netAmount,
            completionDate: payment.completionDate,
            releaseDate: new Date(),
          },
        ],
        totals: {
          subtotal: originalAmount,
          commissionPercentage: commissionPct,
          commissionAmount: commission,
          netTotal: netAmount,
        },
        paymentIds: [payment._id],
        notes: releaseNotes,
      });
    } catch (e) {
      console.warn('⚠️ Failed to create invoice for single release:', e?.message);
    }

    // Emit WebSocket notification to provider
    const io = req.app.get('io');
    if (io) {
      io.emit('payment_released', {
        providerId: payment.providerId,
        paymentId: updatedPayment._id,
        amount: updatedPayment.amount,
        serviceName: updatedPayment.serviceName,
        patientName: updatedPayment.patientName,
        releaseDate: updatedPayment.releaseDate
      });
      console.log('📡 WebSocket notification sent for payment release');
      // Emit invoice event as well
      if (invoiceDoc) {
        io.emit('invoice_issued', {
          providerId: payment.providerId,
          invoiceId: invoiceDoc._id,
          invoiceNumber: invoiceDoc.invoiceNumber,
          totals: invoiceDoc.totals,
          itemsCount: (invoiceDoc.items || []).length,
          issuedAt: invoiceDoc.issuedAt,
        });
        console.log('🧾 Invoice websocket event emitted');
      }
    }

    res.json({
      success: true,
      payment: updatedPayment,
      invoice: invoiceDoc || undefined,
      message: "Payment released to provider successfully"
    });
  } catch (error) {
    console.error(' Payment release error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to release payment",
      error: error.message
    });
  }
};

// Get payments pending release (completed services but not released)
export const getPendingReleasePayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      serviceCompleted: true,
      releasedToProvider: false
    })
    .populate('patientId', 'name email phone')
    .populate('bookingId')
    .sort({ completionDate: 1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending release payments",
      error: error.message
    });
  }
};

// Get payment statistics for admin dashboard
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const pendingRelease = await Payment.countDocuments({
      serviceCompleted: true,
      releasedToProvider: false
    });
    
    const releasedPayments = await Payment.countDocuments({
      releasedToProvider: true
    });

    const paymentsByMethod = await Payment.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);

    const paymentsByProviderType = await Payment.aggregate([
      { $group: { _id: "$providerType", count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalPayments,
        totalAmount: totalAmount[0]?.total || 0,
        pendingRelease,
        releasedPayments,
        paymentsByMethod,
        paymentsByProviderType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message
    });
  }
};

// Get provider's payment history and wallet balance
export const getProviderWallet = async (req, res) => {
  try {
    const { providerId } = req.params;
    console.log(' Fetching wallet for provider:', providerId);

    // Get all payments for this provider
    const payments = await Payment.find({ providerId })
      .populate('patientId', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    // Calculate wallet statistics
    const totalEarnings = payments.reduce((sum, payment) => {
      // Use original amount if available, otherwise use current amount
      return sum + (payment.originalAmount || payment.amount);
    }, 0);

    const releasedPayments = payments.filter(p => p.releasedToProvider);
    const pendingPayments = payments.filter(p => p.serviceCompleted && !p.releasedToProvider);

    // For clarity:
    // - releasedNet: funds already released to provider (after commission)
    // - pendingBalance: funds for completed services not yet released (before commission if stored)
    const releasedNet = releasedPayments.reduce((sum, payment) => sum + (payment.netReleaseAmount || payment.amount), 0);
    // Subtract withdrawals exactly once from released amount
    const withdrawalsAgg = await Withdrawal.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId), status: { $ne: 'rejected' } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalWithdrawn = withdrawalsAgg[0]?.total || 0;
    const availableBalance = Math.max(0, releasedNet - totalWithdrawn);

    const pendingBalance = pendingPayments.reduce((sum, payment) => sum + (payment.originalAmount || payment.amount), 0);

    // Sum withdrawals (exclude rejected) to compute net available (released - withdrawn)
    const walletData = {
      providerId,
      totalEarnings,
      availableBalance,
      pendingBalance,
      totalServices: payments.length,
      completedServices: payments.filter(p => p.serviceCompleted).length,
      payments: payments.map(payment => ({
        _id: payment._id,
        serviceName: payment.serviceName,
        patientName: payment.patientName,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        serviceCompleted: payment.serviceCompleted,
        releasedToProvider: payment.releasedToProvider,
        releaseDate: payment.releaseDate,
        createdAt: payment.createdAt,
        completionDate: payment.completionDate
      }))
    };

    console.log(' Wallet data calculated:', {
      totalEarnings,
      availableBalance,
      pendingBalance,
      releasedNet,
      totalServices: payments.length
    });

    res.json({
      success: true,
      wallet: walletData
    });
  } catch (error) {
    console.error(' Provider wallet fetch error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider wallet",
      error: error.message
    });
  }
};

// Handle provider withdrawal requests
export const requestWithdrawal = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { amount, paymentMethod, accountNumber, accountName } = req.body;

    console.log(' Processing withdrawal request:', {
      providerId,
      amount,
      paymentMethod,
      accountNumber: accountNumber?.substring(0, 4) + '****',
      accountName
    });

    // Validate required fields
    if (!amount || !paymentMethod || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'All withdrawal details are required'
      });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount'
      });
    }

    // Get provider's available balance
    const payments = await Payment.find({ 
      providerId, 
      serviceCompleted: true, 
      releasedToProvider: true 
    });
    
    const releasedNet = payments.reduce((sum, payment) => sum + (payment.netReleaseAmount || payment.amount), 0);

    const withdrawalsAgg = await Withdrawal.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(providerId), status: { $ne: 'rejected' } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalWithdrawn = withdrawalsAgg[0]?.total || 0;
    const availableBalance = Math.max(0, releasedNet - totalWithdrawn);

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal'
      });
    }

    // Generate withdrawal ID
    const withdrawalId = `WD${Date.now()}`;
    
    // Create withdrawal record (mark as approved immediately to avoid 'pending' state)
    const created = await Withdrawal.create({
      providerId,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
      status: 'approved'
    });

    console.log(' Withdrawal request logged:', {
      withdrawalId,
      providerId,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
      requestDate: new Date(),
      status: 'approved'
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalId,
      amount,
      estimatedProcessingTime: '24-48 hours'
    });

  } catch (error) {
    console.error(' Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request',
      error: error.message
    });
  }
};

// Get providers summary for admin
export const getProvidersSummary = async (req, res) => {
  try {
    console.log(' Fetching providers summary...');

    // Load hidden providers to exclude from the summary
    const hiddenDocs = await HiddenProvider.find({}, 'providerId');
    const hiddenIds = hiddenDocs.map(doc => doc.providerId instanceof mongoose.Types.ObjectId ? doc.providerId : new mongoose.Types.ObjectId(doc.providerId));

    // Aggregate payments by provider (do not exclude hidden here);
    // we'll conditionally include hidden providers later only if they have pending unreleased payments
    const matchStage = { $match: {} };

    const providerStats = await Payment.aggregate([
      matchStage,
      {
        $group: {
          _id: '$providerId',
          totalServices: { $sum: 1 },
          completedServices: { $sum: { $cond: ['$serviceCompleted', 1, 0] } },
          pendingServices: { $sum: { $cond: [{ $and: ['$serviceCompleted', { $not: '$releasedToProvider' }] }, 1, 0] } },
          totalEarnings: { $sum: '$amount' },
          pendingAmount: { 
            $sum: { 
              $cond: [
                { $and: ['$serviceCompleted', { $not: '$releasedToProvider' }] }, 
                '$amount', 
                0
              ] 
            }
          },
          releasedAmount: { 
            $sum: { 
              $cond: ['$releasedToProvider', '$amount', 0] 
            }
          }
        }
      }
    ]);

    // Get detailed payments for each provider
    const providersData = [];
    
    for (const stat of providerStats) {
      const isHidden = hiddenIds.some(id => id?.toString() === stat._id?.toString());
      // If provider is hidden AND has no pending unreleased services, skip it
      if (isHidden && (stat.pendingServices === 0)) {
        continue;
      }
      // If provider is hidden BUT has pending services, auto-unhide so it stays visible
      if (isHidden && stat.pendingServices > 0) {
        try {
          await HiddenProvider.findOneAndDelete({ providerId: stat._id });
          console.log(` Auto-unhid provider ${stat._id} due to new pending payments`);
        } catch (e) {
          console.warn('Failed to auto-unhide provider', stat._id, e?.message);
        }
      }
      const payments = await Payment.find({ providerId: stat._id })
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 });

      if (payments.length > 0) {
        // Get provider info from user collection to include avatar
        const providerUser = await User.findById(stat._id).select('name avatar role');
        
        const providerInfo = {
          providerId: stat._id,
          providerName: providerUser?.name || payments[0].providerName || 'Unknown Provider',
          providerType: providerUser?.role || payments[0].providerType || 'doctor',
          providerAvatar: providerUser?.avatar || null
        };

        providersData.push({
          ...providerInfo,
          totalServices: stat.totalServices,
          completedServices: stat.completedServices,
          pendingServices: stat.pendingServices,
          totalEarnings: stat.totalEarnings,
          pendingAmount: stat.pendingAmount,
          releasedAmount: stat.releasedAmount,
          payments: payments.map(payment => ({
            _id: payment._id,
            serviceName: payment.serviceName,
            patientName: payment.patientName,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            serviceCompleted: payment.serviceCompleted,
            releasedToProvider: payment.releasedToProvider,
            releaseDate: payment.releaseDate,
            createdAt: payment.createdAt,
            completionDate: payment.completionDate
          }))
        });
      }
    }

    console.log(' Providers summary fetched:', providersData.length, 'providers');

    res.json({
      success: true,
      providers: providersData
    });

  } catch (error) {
    console.error(' Providers summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers summary',
      error: error.message
    });
  }
};

// Hide a provider from providers summary (soft delete for admin view)
export const hideProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'providerId is required' });
    }
    const pid = mongoose.Types.ObjectId.isValid(providerId) ? new mongoose.Types.ObjectId(providerId) : providerId;
    const existing = await HiddenProvider.findOne({ providerId: pid });
    if (existing) {
      return res.json({ success: true, message: 'Provider already hidden' });
    }
    await HiddenProvider.create({ providerId: pid, createdBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined });
    return res.json({ success: true, message: 'Provider hidden successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to hide provider', error: error.message });
  }
};

// Unhide a provider (make it visible again in providers summary)
export const unhideProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'providerId is required' });
    }
    const pid = mongoose.Types.ObjectId.isValid(providerId) ? new mongoose.Types.ObjectId(providerId) : providerId;
    const result = await HiddenProvider.findOneAndDelete({ providerId: pid });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Provider was not hidden' });
    }
    return res.json({ success: true, message: 'Provider unhidden successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to unhide provider', error: error.message });
  }
};

// Bulk release payments for a provider with invoice
export const bulkReleasePayments = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { adminCommission, deductionAmount, finalAmount } = req.body;
    const adminId = req.user?.id;

    console.log(' Processing bulk payment release:', {
      providerId,
      adminCommission,
      deductionAmount,
      finalAmount,
      adminId
    });

    // Find all completed but unreleased payments for this provider
    const pendingPayments = await Payment.find({
      providerId,
      serviceCompleted: true,
      releasedToProvider: false
    });

    if (pendingPayments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payments found for this provider'
      });
    }

    const totalAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Validate amounts
    if (Math.abs(totalAmount - (finalAmount + deductionAmount)) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Amount calculation mismatch'
      });
    }

    // Convert adminId to ObjectId if valid, otherwise set to null
    let adminObjectId = null;
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      adminObjectId = new mongoose.Types.ObjectId(adminId);
    }

    // Update each payment individually with proper amount calculation
    const updatePromises = pendingPayments.map(async (payment) => {
      const originalAmount = payment.amount;
      const commissionDeduction = (originalAmount * adminCommission) / 100;
      const netAmountToProvider = originalAmount - commissionDeduction;
      
      return Payment.findByIdAndUpdate(
        payment._id,
        {
          $set: {
            releasedToProvider: true,
            releaseDate: new Date(),
            adminId: adminObjectId,
            adminCommission: adminCommission,
            adminCommissionAmount: commissionDeduction,
            originalAmount: originalAmount,
            netReleaseAmount: netAmountToProvider,
            amount: netAmountToProvider // Update amount to net amount after commission
          }
        },
        { new: true }
      );
    });

    const updatedPayments = await Promise.all(updatePromises);
    console.log(' Bulk payment release completed:', updatedPayments.length, 'payments updated with commission deduction');

    // Calculate totals for response
    const totalCommissionEarned = updatedPayments.reduce((sum, payment) => sum + (payment.adminCommissionAmount || 0), 0);
    const totalNetReleased = updatedPayments.reduce((sum, payment) => sum + (payment.netReleaseAmount || 0), 0);

    // Create a consolidated invoice for this bulk release
    let bulkInvoice = null;
    try {
      const first = pendingPayments[0];
      bulkInvoice = await Invoice.create({
        providerId,
        providerName: first?.providerName || 'Provider',
        providerType: first?.providerType || 'doctor',
        issuedBy: adminObjectId || undefined,
        items: updatedPayments.map(p => ({
          paymentId: p._id,
          serviceId: p.serviceId,
          serviceName: p.serviceName,
          patientName: p.patientName,
          originalAmount: p.originalAmount || p.amount + (p.adminCommissionAmount || 0),
          adminCommissionAmount: p.adminCommissionAmount || 0,
          netAmount: p.netReleaseAmount || p.amount,
          completionDate: p.completionDate,
          releaseDate: p.releaseDate,
        })),
        totals: {
          subtotal: pendingPayments.reduce((s, x) => s + (x.amount || 0), 0),
          commissionPercentage: adminCommission,
          commissionAmount: totalCommissionEarned,
          netTotal: totalNetReleased,
        },
        paymentIds: updatedPayments.map(p => p._id),
        notes: `Bulk release of ${updatedPayments.length} payments`,
      });
    } catch (e) {
      console.warn(' Failed to create bulk invoice:', e?.message);
    }

    // Emit WebSocket notification to provider with NET amount and invoice
    const io = req.app.get('io');
    if (io) {
      io.emit('bulk_payment_released', {
        providerId,
        totalPayments: pendingPayments.length,
        totalAmount: totalNetReleased, // Send only net amount to provider
        adminCommission,
        deductionAmount: totalCommissionEarned,
        releaseDate: new Date()
      });
      console.log(' WebSocket notification sent - Provider receives NET amount:', totalNetReleased);
      if (bulkInvoice) {
        io.emit('invoice_issued', {
          providerId,
          invoiceId: bulkInvoice._id,
          invoiceNumber: bulkInvoice.invoiceNumber,
          totals: bulkInvoice.totals,
          itemsCount: (bulkInvoice.items || []).length,
          issuedAt: bulkInvoice.issuedAt,
        });
        console.log(' Bulk invoice websocket event emitted');
      }
    }

    res.json({
      success: true,
      message: 'Bulk payment release completed successfully',
      releasedPayments: updatedPayments.length,
      totalOriginalAmount: totalAmount,
      adminCommissionEarned: totalCommissionEarned,
      netAmountToProvider: totalNetReleased,
      adminCommissionPercentage: adminCommission,
      invoice: bulkInvoice || undefined,
    });

  } catch (error) {
    console.error(' Bulk payment release error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk payment release',
      error: error.message
    });
  }
};