// controllers/booking.controller.js
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// A helper to get the correct Mongoose model based on the service type string
const getServiceModel = (serviceModel) => {
  switch (serviceModel) {
    case "ClinicService":
      return mongoose.model("ClinicService");
    case "DoctorService":
      return mongoose.model("DoctorService");
    case "LaboratoryTest":
      return mongoose.model("LaboratoryTest");
    case "Medicine":
      return mongoose.model("Medicine");
    default:
      return null;
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      serviceModel, // e.g., 'ClinicService', 'DoctorService'
      paymentMethod,
      serviceSnapshot, // { name, price, description }
    } = req.body;

    const buyerId = req.userId;

    if (
      !providerId ||
      !serviceId ||
      !serviceModel ||
      !paymentMethod ||
      !serviceSnapshot
    ) {
      return res
        .status(400)
        .json({ message: "Missing required booking information." });
    }

    // Validate provider and buyer exist
    const [provider, buyer] = await Promise.all([
      User.findById(providerId),
      User.findById(buyerId),
    ]);

    if (!provider || !buyer) {
      return res.status(404).json({ message: "Provider or buyer not found." });
    }

    const newBooking = new Booking({
      buyer: buyerId,
      provider: providerId,
      serviceId,
      serviceModel,
      serviceSnapshot,
      paymentMethod,
      paymentStatus: "completed", // Dummy payment is always successful
      bookingStatus: "pending", // Provider needs to confirm
      transactionId: `txn_${Date.now()}`, // Dummy transaction ID
    });

    await newBooking.save();

    // Populate the provider and buyer details before sending the response
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('provider', 'name businessName avatar role')
      .populate('buyer', 'name avatar');

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: populatedBooking });
  } catch (error) {
    console.error("Booking creation error:", error);
    res
      .status(500)
      .json({
        message: "Server error during booking creation.",
        error: error.message,
      });
  }
};

export const getBookingsForUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ buyer: req.userId })
      .populate("provider", "name businessName avatar role")
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user bookings", error: error.message });
  }
};

export const getBookingsForProvider = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.userId })
      .populate("buyer", "name avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching provider bookings",
        error: error.message,
      });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("provider", "name businessName avatar role")
      .populate("buyer", "name avatar");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the user requesting is the buyer or provider
    if (req.userId !== booking.buyer._id.toString() && req.userId !== booking.provider._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to view this booking." });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching booking details", error: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the user deleting is the buyer
    if (req.userId !== booking.buyer.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this booking." });
    }

    await booking.deleteOne();

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

export const deleteAllUserBookings = async (req, res) => {
  try {
    await Booking.deleteMany({ buyer: req.userId });
    res.status(200).json({ message: "All your bookings have been deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting all user bookings", error: error.message });
  }
};
