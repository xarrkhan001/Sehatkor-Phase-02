// controllers/booking.controller.js
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientContact,
      providerId,
      providerName,
      providerType,
      serviceId,
      serviceName,
      paymentMethod,
      paymentNumber,
      // optional pricing and variant context
      price,
      currency,
      variantIndex,
      variantLabel,
      variantTimeRange,
      image,
      location,
      phone,
    } = req.body || {};

    // Basic validation
    const missing = [];
    if (!patientId) missing.push("patientId");
    if (!patientName) missing.push("patientName");
    if (!patientContact) missing.push("patientContact");
    if (!providerId) missing.push("providerId");
    if (!providerName) missing.push("providerName");
    if (!providerType) missing.push("providerType");
    if (!serviceId) missing.push("serviceId");
    if (!serviceName) missing.push("serviceName");
    if (!paymentMethod) missing.push("paymentMethod");
    if (!paymentNumber) missing.push("paymentNumber");
    if (!price || price <= 0) missing.push("price");
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // Normalize providerType to match schema enum
    const normalizeProviderType = (t) => {
      if (!t) return null;
      const v = String(t).toLowerCase();
      if (v === "doctor") return "doctor";
      if (v === "hospital" || v === "clinic" || v === "clinic/hospital") return "hospital";
      if (v === "lab" || v === "laboratory") return "lab";
      if (v === "pharmacy" || v === "pharmacies") return "pharmacy";
      return null;
    };

    const providerTypeNormalized = normalizeProviderType(providerType);
    const allowedTypes = ["doctor", "hospital", "lab", "pharmacy"];
    if (!providerTypeNormalized || !allowedTypes.includes(providerTypeNormalized)) {
      return res.status(400).json({
        message: `Invalid providerType. Received: ${providerType}. Allowed: ${allowedTypes.join(", ")}`,
      });
    }

    if (!["easypaisa", "jazzcash"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid paymentMethod" });
    }
    if (String(paymentNumber).length < 8 || String(paymentNumber).length > 20) {
      return res.status(400).json({ message: "Invalid paymentNumber length" });
    }

    // Create booking first
    const booking = await Booking.create({
      patientId,
      patientName,
      providerId,
      providerName,
      providerType: providerTypeNormalized,
      serviceId,
      serviceName,
      paymentMethod,
      paymentNumber,
      // optional/snapshot fields
      price: Number(price) || 0,
      currency: currency || 'PKR',
      variantIndex: typeof variantIndex === 'number' ? variantIndex : undefined,
      variantLabel: variantLabel || undefined,
      variantTimeRange: variantTimeRange || undefined,
      image: image || undefined,
      location: location || undefined,
      phone: phone || undefined,
    });

    // Create payment record
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment = await Payment.create({
      bookingId: booking._id,
      patientId,
      patientName,
      patientContact,
      providerId,
      providerName,
      providerType: providerTypeNormalized,
      serviceId,
      serviceName,
      amount: Number(price),
      paymentMethod,
      paymentNumber,
      transactionId,
      metadata: {
        variantIndex,
        variantLabel,
        variantTimeRange,
        image,
        location,
        phone
      }
    });

    return res.status(201).json({
      success: true,
      booking,
      payment,
      message: "Service booked and payment recorded successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: "Booking error", error: error?.message || error });
  }
};

// GET /api/bookings/patient/:id
export const getBookingsByPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ patientId: id }).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch patient bookings", error: error?.message || error });
  }
};

// GET /api/bookings/provider/:id
export const getBookingsByProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ providerId: id }).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch provider bookings", error: error?.message || error });
  }
};

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete booking", error: error?.message || error });
  }
};

// DELETE /api/bookings
export const deleteAllBookings = async (_req, res) => {
  try {
    const result = await Booking.deleteMany({});
    return res.json({ deletedCount: result.deletedCount || 0 });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete all bookings", error: error?.message || error });
  }
};

// PUT /api/bookings/:id/schedule
export const scheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledTime, communicationChannel } = req.body;

    if (!scheduledTime || !communicationChannel) {
      return res.status(400).json({ message: "scheduledTime and communicationChannel are required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "Scheduled", scheduledTime, communicationChannel },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule booking", error: error?.message || error });
  }
};

// PUT /api/bookings/:id/complete
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(id, { status: "Completed" }, { new: true });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete booking", error: error?.message || error });
  }
};