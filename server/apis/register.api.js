import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

export const register = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      phoneAlternate,
      cnic,
      password,
      confirmPassword, // frontend only
      licenseNumber,
      businessName,
      address,
      city,
      province,
      mapsLocation,
      specialization,
      description,
      designation,
      servicesOffered,
      deliveryAvailable,
      service24x7,
      operatingHours,
      staffDetails,
      bankDetails
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const allowedRoles = ['patient', 'doctor', 'clinic/hospital', 'laboratory', 'pharmacy'];
    

    
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Data type conversion and validation
    const safeServicesOffered = Array.isArray(servicesOffered) ? servicesOffered : 
                               (typeof servicesOffered === 'string' ? [servicesOffered] : []);
    
    const safeDeliveryAvailable = typeof deliveryAvailable === 'boolean' ? deliveryAvailable :
                                 (deliveryAvailable === 'true' ? true : false);
    
    const safeService24x7 = typeof service24x7 === 'boolean' ? service24x7 :
                           (service24x7 === 'true' ? true : false);
    
    // Defensive: ensure nested objects are objects or undefined
    const safeOperatingHours = isObject(operatingHours) ? operatingHours : undefined;
    const safeStaffDetails = isObject(staffDetails) ? staffDetails : undefined;
    const safeBankDetails = isObject(bankDetails) ? bankDetails : undefined;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      phone,
      phoneAlternate,
      cnic,
      licenseNumber,
      businessName,
      address,
      city,
      province,
      mapsLocation,
      specialization,
      description,
      designation,
      servicesOffered: safeServicesOffered,
      deliveryAvailable: safeDeliveryAvailable,
      service24x7: safeService24x7,
      operatingHours: safeOperatingHours,
      staffDetails: safeStaffDetails,
      bankDetails: safeBankDetails,
      isVerified: ['doctor', 'pharmacy', 'laboratory', 'clinic/hospital'].includes(role) ? false : true,
      verificationStatus: ['doctor', 'pharmacy', 'laboratory', 'clinic/hospital'].includes(role) ? 'pending' : 'approved',
    });

    await newUser.save();
    const token = generateToken(newUser);
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Error during registration', error: err.message });
  }
}; 