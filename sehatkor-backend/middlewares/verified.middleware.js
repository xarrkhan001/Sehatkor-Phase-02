import User from '../models/User.js';

export const verifiedUserOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('isVerified');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!user.isVerified) return res.status(403).json({ message: 'Account not verified' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Verification check failed', error: err.message });
  }
};






