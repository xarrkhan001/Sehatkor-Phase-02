// controllers/doctor.controller.js
import User from '../models/User.js';

// 📌 Get current doctor's profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.userId).select('-password');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctor profile', error: error.message });
  }
};

// 📌 Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;

    const doctor = await User.findById(req.userId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(doctor, updates);
    await doctor.save();

    res.status(200).json({ message: 'Doctor profile updated', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
  }
};

// 📌 Get all verified doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', verified: true }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// 🔍 Search doctor by name or specialization
export const searchDoctors = async (req, res) => {
  try {
    const { query } = req.query;

    const doctors = await User.find({
      role: 'doctor',
      verified: true,
      $or: [
        { name: new RegExp(query, 'i') },
        { specialization: new RegExp(query, 'i') }
      ]
    }).select('-password');

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// 🩺 Get doctor profile by ID (for patient viewing)
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      verified: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctor details', error: error.message });
  }
};
