// controllers/booking.controller.js
import Booking from "../models/Booking.js";

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      providerId,
      providerName,
      providerType,
      serviceId,
      serviceName,
      paymentMethod,
      paymentNumber,
    } = req.body || {};

    // Basic validation
    const missing = [];
    if (!patientId) missing.push("patientId");
    if (!patientName) missing.push("patientName");
    if (!providerId) missing.push("providerId");
    if (!providerName) missing.push("providerName");
    if (!providerType) missing.push("providerType");
    if (!serviceId) missing.push("serviceId");
    if (!serviceName) missing.push("serviceName");
    if (!paymentMethod) missing.push("paymentMethod");
    if (!paymentNumber) missing.push("paymentNumber");
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    if (!["easypaisa", "jazzcash"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid paymentMethod" });
    }
    if (String(paymentNumber).length < 8 || String(paymentNumber).length > 20) {
      return res.status(400).json({ message: "Invalid paymentNumber length" });
    }

    const booking = await Booking.create({
      patientId,
      patientName,
      providerId,
      providerName,
      providerType,
      serviceId,
      serviceName,
      paymentMethod,
      paymentNumber,
          });

    return res.status(201).json(booking);
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