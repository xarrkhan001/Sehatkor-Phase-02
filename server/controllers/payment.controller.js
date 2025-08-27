import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

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
    const { paymentId } = req.params;
    const { adminId, releaseNotes = "" } = req.body;

    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    if (!payment.serviceCompleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot release payment - service not completed yet"
      });
    }

    if (payment.releasedToProvider) {
      return res.status(400).json({
        success: false,
        message: "Payment already released to provider"
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        releasedToProvider: true,
        releaseDate: new Date(),
        releasedBy: adminId,
        releaseNotes,
        paymentStatus: "released"
      },
      { new: true }
    ).populate('patientId', 'name email phone');

    res.json({
      success: true,
      payment: updatedPayment,
      message: "Payment released to provider successfully"
    });
  } catch (error) {
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