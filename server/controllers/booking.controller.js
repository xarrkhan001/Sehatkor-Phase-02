// controllers/booking.controller.js
export const createBooking = async (req, res) => {
  try {
    const { patientId, serviceId, date } = req.body;
    // Booking logic
    res.status(201).json({ message: 'Booking created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Booking error', error });
  }
};