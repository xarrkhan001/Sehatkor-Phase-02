// controllers/auth.controller.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ALLOWED_ROLES } from '../middlewares/role.middleware.js';
import { sendPasswordResetEmail } from '../config/email.js';

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

    // Enforce verification for provider roles only; patients can login immediately
    const providerRoles = ['doctor', 'clinic/hospital', 'laboratory', 'pharmacy'];
    if (providerRoles.includes(user.role) && !user.isVerified) {
      return res.status(403).json({ message: 'Account not verified by admin' });
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// 📌 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const debug = process.env.DEBUG_PASSWORD_RESET === 'true';
    if (debug) console.log('Forgot password: request received');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (debug) console.log('Forgot password: looking up user');
    const user = await User.findOne({ email });
    if (!user) {
      if (debug) console.log('Forgot password: user not found');
      return res.status(404).json({ message: 'User not found with this email' });
    }
    if (debug) console.log('Forgot password: user found');

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    
    if (debug) console.log('Forgot password: saving user with reset token');
    await user.save();

    if (debug) console.log('Forgot password: attempting to send email');
    // Send email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      if (debug) console.log('Forgot password: email sending failed');
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent', error: emailResult.error });
    }

    if (debug) console.log('Forgot password: email sent successfully');
    res.status(200).json({ 
      message: 'Password reset email sent successfully. Please check your email.' 
    });

  } catch (err) {
    console.error('Forgot password error:', err.message);
    if (process.env.DEBUG_PASSWORD_RESET === 'true') {
      console.error('Error stack:', err.stack);
    }
    res.status(500).json({ message: 'Error in forgot password', error: err.message });
  }
};

// 📌 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    });

  } catch (err) {
    res.status(500).json({ message: 'Error in reset password', error: err.message });
  }
};
