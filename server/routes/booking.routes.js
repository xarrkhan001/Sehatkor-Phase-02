import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createBooking,
  getBookingsForUser,
  getBookingsForProvider,
  getBookingById,
  deleteBooking,
  deleteAllUserBookings,
} from "../controllers/booking.controller.js";

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post("/", authMiddleware, createBooking);

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get("/my-bookings", authMiddleware, getBookingsForUser);

// @route   GET /api/bookings/provider-bookings
// @desc    Get all bookings for the logged-in provider
// @access  Private
router.get("/provider-bookings", authMiddleware, getBookingsForProvider);

// @route   GET /api/bookings/:bookingId
// @desc    Get a single booking by ID
// @access  Private
router.get("/:bookingId", authMiddleware, getBookingById);

// @route   DELETE /api/bookings/:bookingId
// @desc    Delete a single booking
// @access  Private
router.delete("/:bookingId", authMiddleware, deleteBooking);

// @route   DELETE /api/bookings/my-bookings/delete-all
// @desc    Delete all bookings for a user
// @access  Private
router.delete("/my-bookings/delete-all", authMiddleware, deleteAllUserBookings);

export default router;
