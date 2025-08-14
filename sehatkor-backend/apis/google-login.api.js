import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Minimal Google ID token verification using google's tokeninfo endpoint to avoid adding a new SDK
async function verifyGoogleIdToken(idToken) {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) throw new Error('tokeninfo rejected');
    const data = await res.json();
    if (!data || !data.email) throw new Error('Google response missing email');
    // Allow one or many client IDs via env, and be lenient in non-production
    const allowedClientIds = (process.env.GOOGLE_ALLOWED_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowedClientIds.length > 0 && !allowedClientIds.includes(data.aud)) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Google client mismatch');
      } else {
        console.warn('⚠️ Google client mismatch (ignoring in non-production). Got:', data.aud);
      }
    }
    return {
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: data.picture,
      sub: data.sub,
    };
  } catch (e) {
    // Dev fallback: decode ID token locally without verifying signature
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Failed to verify Google token');
    }
    try {
      const [, payloadB64] = idToken.split('.');
      const json = JSON.parse(Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
      if (!json?.email) throw new Error('ID token missing email');
      return {
        email: json.email,
        name: json.name || json.email.split('@')[0],
        picture: json.picture,
        sub: json.sub,
      };
    } catch {
      throw new Error('Invalid Google token');
    }
  }
}

const generateToken = (user) => jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

export const googleLogin = async (req, res) => {
  try {
    const { idToken, role = 'patient' } = req.body || {};
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const profile = await verifyGoogleIdToken(idToken);

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        role: ['patient','doctor','clinic/hospital','laboratory','pharmacy'].includes(role) ? role : 'patient',
        avatar: profile.picture,
        isVerified: role === 'patient',
        password: Math.random().toString(36).slice(2) // placeholder; not used for google users
      });
    }

    // Gate unverified providers
    if (user.role !== 'patient' && !user.isVerified) {
      return res.status(403).json({ message: 'Account not verified by admin' });
    }

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ token, user: userObj });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(400).json({ message: err?.message || 'Google login failed' });
  }
};


