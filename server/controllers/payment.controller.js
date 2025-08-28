import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Withdrawal from "../models/Withdrawal.js";
import mongoose from "mongoose";

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
    const { adminId, releaseNotes = "" } = req.body;
    
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

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        releasedToProvider: true,
        releaseDate: new Date(),
        releasedBy: validAdminId,
        releaseNotes,
        paymentStatus: "released"
      },
      { new: true }
    ).populate('patientId', 'name email phone');

    console.log('✅ Payment released successfully:', updatedPayment._id);

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
    }

    res.json({
      success: true,
      payment: updatedPayment,
      message: "Payment released to provider successfully"
    });
  } catch (error) {
    console.error('💥 Payment release error:', error);
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
    console.log('💰 Fetching wallet for provider:', providerId);

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

    console.log('📋 Wallet data calculated:', {
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
    console.error('💥 Provider wallet fetch error:', error);
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

    console.log('💸 Processing withdrawal request:', {
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

    console.log('✅ Withdrawal request logged:', {
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
    console.error('💥 Withdrawal request error:', error);
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
    console.log('📊 Fetching providers summary...');

    // Aggregate payments by provider
    const providerStats = await Payment.aggregate([
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
      const payments = await Payment.find({ providerId: stat._id })
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 });

      if (payments.length > 0) {
        // Get provider info from user collection to include avatar
        const providerUser = await User.findById(stat._id).select('name avatar role');
        
        const providerInfo = {
          providerId: stat._id,
          providerName: providerUser?.name || payments[0].providerName || 'Unknown Provider',
          providerType: providerUser?.role || payments[0].providerType || 'unknown',
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
            serviceCompleted: payment.serviceCompleted,
            releasedToProvider: payment.releasedToProvider,
            releaseDate: payment.releaseDate,
            createdAt: payment.createdAt,
            completionDate: payment.completionDate
          }))
        });
      }
    }

    console.log('✅ Providers summary fetched:', providersData.length, 'providers');

    res.json({
      success: true,
      providers: providersData
    });

  } catch (error) {
    console.error('💥 Providers summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers summary',
      error: error.message
    });
  }
};

// Bulk release payments for a provider
export const bulkReleasePayments = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { adminCommission, deductionAmount, finalAmount } = req.body;
    const adminId = req.user?.id;

    console.log('💰 Processing bulk payment release:', {
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
    console.log('✅ Bulk payment release completed:', updatedPayments.length, 'payments updated with commission deduction');

    // Calculate totals for response
    const totalCommissionEarned = updatedPayments.reduce((sum, payment) => sum + (payment.adminCommissionAmount || 0), 0);
    const totalNetReleased = updatedPayments.reduce((sum, payment) => sum + (payment.netReleaseAmount || 0), 0);

    // Emit WebSocket notification to provider with NET amount
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
      console.log('📡 WebSocket notification sent - Provider receives NET amount:', totalNetReleased);
    }

    res.json({
      success: true,
      message: 'Bulk payment release completed successfully',
      releasedPayments: updatedPayments.length,
      totalOriginalAmount: totalAmount,
      adminCommissionEarned: totalCommissionEarned,
      netAmountToProvider: totalNetReleased,
      adminCommissionPercentage: adminCommission
    });

  } catch (error) {
    console.error('💥 Bulk payment release error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk payment release',
      error: error.message
    });
  }
};