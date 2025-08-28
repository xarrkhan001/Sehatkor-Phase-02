import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
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
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const releasedPayments = payments.filter(p => p.releasedToProvider);
    const pendingPayments = payments.filter(p => p.serviceCompleted && !p.releasedToProvider);
    
    const availableBalance = releasedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingBalance = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

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

// Provider withdrawal request
export const requestWithdrawal = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { amount, paymentMethod, accountNumber, accountName } = req.body;
    
    console.log('💸 Processing withdrawal request:', { providerId, amount, paymentMethod });

    // Get provider's available balance
    const releasedPayments = await Payment.find({
      providerId,
      releasedToProvider: true
    });
    
    const availableBalance = releasedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance for withdrawal"
      });
    }

    // For now, we'll just log the withdrawal request
    // In a real implementation, this would integrate with payment gateways
    console.log('✅ Withdrawal request logged:', {
      providerId,
      amount,
      paymentMethod,
      accountNumber,
      accountName,
      availableBalance
    });

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawalId: `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      paymentMethod,
      status: "pending"
    });
  } catch (error) {
    console.error('💥 Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process withdrawal request",
      error: error.message
    });
  }
};