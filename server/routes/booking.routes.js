import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createBooking,
  getBookingsByPatient,
  getBookingsByProvider,
  deleteBooking,
  deleteAllBookings,
  scheduleBooking,
  completeBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

// POST /api/bookings
router.post("/", authMiddleware, createBooking);

// GET /api/bookings/patient/:id
router.get("/patient/:id", authMiddleware, getBookingsByPatient);

// GET /api/bookings/provider/:id
router.get("/provider/:id", authMiddleware, getBookingsByProvider);

// DELETE /api/bookings/:id
router.delete("/:id", authMiddleware, deleteBooking);

// DELETE /api/bookings (delete all)
router.delete("/", authMiddleware, deleteAllBookings);

// PUT /api/bookings/:id/schedule
router.put("/:id/schedule", authMiddleware, scheduleBooking);

// PUT /api/bookings/:id/complete
router.put("/:id/complete", authMiddleware, completeBooking);

export default router;