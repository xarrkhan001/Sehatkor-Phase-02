// controllers/auth.controller.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ALLOWED_ROLES } from '../middlewares/role.middleware.js';

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 📌 Register (with hashing)
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, phone } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
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
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: fullName,
      email,
      password: hashedPassword,
      role: role || 'patient',
      phone,
      isVerified: role === 'doctor' || role === 'clinic/hospital' || role === 'laboratory' || role === 'pharmacy' ? false : true,
    });

    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser);
    // Exclude password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Error during registration', error: err.message });
  }
};

// 📌 Login (with JWT)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Optionally check for verification if needed
    // if (!user.isVerified)
    //   return res.status(403).json({ message: 'Account not verified by admin' });

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};
