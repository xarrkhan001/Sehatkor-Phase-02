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

    // Providers can login if verified OR explicitly allowed to operate by admin
    if (["doctor", "clinic/hospital", "laboratory", "pharmacy"].includes(user.role)) {
      const canLogin = Boolean(user.isVerified) || Boolean(user.allowedToOperate);
      if (!canLogin) {
        return res.status(403).json({ message: 'Account not verified or allowed by admin' });
      }
    }

    const token = generateToken(user);
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
}; 