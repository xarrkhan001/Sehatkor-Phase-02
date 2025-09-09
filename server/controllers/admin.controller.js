// controllers/admin.controller.js
import User from '../models/User.js';
import DoctorService from '../models/DoctorService.js';
import ClinicService from '../models/ClinicService.js';
import Medicine from '../models/Medicine.js';
import LaboratoryTest from '../models/LaboratoryTest.js';
import { getModelForServiceType } from '../utils/serviceModelMapper.js';

// 📊 Admin Dashboard - Get platform stats
export const getAdminStats = async (req, res) => {
  try {
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPharmacies = await User.countDocuments({ role: 'pharmacy' });
    const totalLabs = await User.countDocuments({ role: 'laboratory' });
    const totalHospitals = await User.countDocuments({ role: 'clinic/hospital' });

    res.status(200).json({
      stats: {
        verifiedUsers,
        totalDoctors,
        totalPharmacies,
        totalLabs,
        totalHospitals,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// 🔐 Secure API endpoint for verified users count
export const getVerifiedUsersCount = async (req, res) => {
  try {
    // Temporarily remove admin role validation for testing
    // if (!req.userRole || req.userRole !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    // }

    const verifiedCount = await User.countDocuments({ isVerified: true });
    
    res.status(200).json({
      success: true,
      data: {
        verifiedUsersCount: verifiedCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching verified users count', 
      error: error.message 
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// ✅ Approve or reject an entity (doctor, pharmacy, lab, clinic, laboratory)
export const verifyEntity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // status: 'approved' or 'rejected'

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (status === 'approved') {
      user.isVerified = true;
      await user.save();
      return res.status(200).json({ message: 'Entity approved and verified successfully' });
    } else if (status === 'rejected') {
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'Entity rejected and removed successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid status value' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
};

// 🔍 Get all unverified providers/entities
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isVerified: false,
      role: { $in: ['doctor', 'pharmacy', 'laboratory', 'clinic/hospital'] }
    }).select('-password');
    res.status(200).json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending verifications', error: error.message });
  }
};

// 👥 Get all verified users with pagination (including patients)
export const getVerifiedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({
      isVerified: true,
      role: { $in: ['doctor', 'pharmacy', 'laboratory', 'clinic/hospital', 'patient'] }
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments({
      isVerified: true,
      role: { $in: ['doctor', 'pharmacy', 'laboratory', 'clinic/hospital', 'patient'] }
    });

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasMore: skip + users.length < totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verified users', error: error.message });
  }
};

// 🗑️ Delete a user permanently
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);
    
    // Get Socket.IO instance from app
    const io = req.app.get('io');
    if (io) {
      // Emit account termination event to the specific user
      io.emit('account_terminated', {
        userId: userId,
        message: 'Your account has been terminated by an administrator for policy violations.',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// 🌟 Get all services for admin recommendation management
export const getAllServicesForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const providerType = req.query.providerType || 'all';

    // Fetch services from all providers with provider details
    let allServices = [];

    // Helper function to add services from a model
    const addServicesFromModel = async (Model, type) => {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { providerName: { $regex: search, $options: 'i' } }
        ];
      }
      
      const services = await Model.find(query)
        .populate('providerId', 'name phone avatar')
        .sort({ recommended: -1, createdAt: -1 })
        .lean();
      
      return services.map(service => ({
        ...service,
        id: service._id,
        providerType: type,
        providerPhone: service.providerId?.phone || null,
        providerName: service.providerId?.name || service.providerName,
      }));
    };

    if (providerType === 'all' || providerType === 'doctor') {
      const doctorServices = await addServicesFromModel(DoctorService, 'doctor');
      allServices.push(...doctorServices);
    }
    if (providerType === 'all' || providerType === 'clinic') {
      const clinicServices = await addServicesFromModel(ClinicService, 'clinic');
      allServices.push(...clinicServices);
    }
    if (providerType === 'all' || providerType === 'pharmacy') {
      const pharmacyServices = await addServicesFromModel(Medicine, 'pharmacy');
      allServices.push(...pharmacyServices);
    }
    if (providerType === 'all' || providerType === 'laboratory') {
      const laboratoryServices = await addServicesFromModel(LaboratoryTest, 'laboratory');
      allServices.push(...laboratoryServices);
    }

    // Sort by recommended first, then by creation date
    allServices.sort((a, b) => {
      if (a.recommended !== b.recommended) {
        return b.recommended ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Apply pagination
    const paginatedServices = allServices.slice(skip, skip + limit);
    const totalServices = allServices.length;

    res.status(200).json({
      services: paginatedServices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalServices / limit),
        totalServices,
        hasMore: skip + paginatedServices.length < totalServices
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// 🌟 Toggle service recommendation status
export const toggleServiceRecommendation = async (req, res) => {
  try {
    const { serviceId, providerType } = req.params;
    const { recommended } = req.body;

    if (!serviceId || !providerType) {
      return res.status(400).json({ message: 'Service ID and provider type are required' });
    }

    const ServiceModel = getModelForServiceType(providerType);
    if (!ServiceModel) {
      return res.status(400).json({ message: 'Invalid provider type' });
    }

    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.recommended = Boolean(recommended);
    await service.save();

    // Broadcast real-time update to all clients
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('service_recommendation_toggled', {
          serviceId: String(service._id),
          providerType: String(providerType),
          recommended: Boolean(service.recommended),
        });
      }
    } catch {}

    res.status(200).json({
      message: `Service ${recommended ? 'marked as recommended' : 'unmarked as recommended'} successfully`,
      service: {
        id: service._id,
        name: service.name,
        providerType,
        recommended: service.recommended
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service recommendation', error: error.message });
  }
};

// 🌟 Get recommended services count
export const getRecommendedServicesCount = async (req, res) => {
  try {
    const doctorCount = await DoctorService.countDocuments({ recommended: true });
    const clinicCount = await ClinicService.countDocuments({ recommended: true });
    const pharmacyCount = await Medicine.countDocuments({ recommended: true });
    const laboratoryCount = await LaboratoryTest.countDocuments({ recommended: true });
    
    const total = doctorCount + clinicCount + pharmacyCount + laboratoryCount;

    res.status(200).json({
      total,
      byType: {
        doctor: doctorCount,
        clinic: clinicCount,
        pharmacy: pharmacyCount,
        laboratory: laboratoryCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommended services count', error: error.message });
  }
};