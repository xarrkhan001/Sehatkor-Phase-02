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
    const { idToken, role = 'patient', additionalFields } = req.body || {};
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const profile = await verifyGoogleIdToken(idToken);

    let user = await User.findOne({ email: profile.email });
    
    // If user doesn't exist, check if additional fields are provided
    if (!user) {
      // For new users, require additional fields
      if (!additionalFields) {
        return res.status(400).json({ 
          message: 'Additional fields required for new user registration',
          requiresAdditionalFields: true,
          profile: {
            name: profile.name,
            email: profile.email,
            picture: profile.picture
          }
        });
      }

      // Validate required fields
      const requiredFields = ['phone', 'cnic', 'address', 'city', 'province'];
      const missingFields = requiredFields.filter(field => !additionalFields[field] || additionalFields[field].trim() === '');
      
      // Role-specific required fields
      if (role === 'doctor' && (!additionalFields.licenseNumber || additionalFields.licenseNumber.trim() === '')) {
        missingFields.push('licenseNumber');
      }
      if (role === 'doctor' && (!additionalFields.designation || additionalFields.designation.trim() === '')) {
        missingFields.push('designation');
      }
      if (['clinic/hospital', 'laboratory', 'pharmacy'].includes(role) && (!additionalFields.businessName || additionalFields.businessName.trim() === '')) {
        missingFields.push('businessName');
      }

      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        });
      }

      // Create user with additional fields
      const userRole = ['patient','doctor','clinic/hospital','laboratory','pharmacy'].includes(role) ? role : 'patient';
      user = await User.create({
        name: profile.name,
        email: profile.email,
        role: userRole,
        avatar: profile.picture,
        isVerified: userRole === 'patient',
        password: Math.random().toString(36).slice(2), // placeholder; not used for google users
        phone: additionalFields.phone,
        cnic: additionalFields.cnic,
        licenseNumber: additionalFields.licenseNumber || '',
        businessName: additionalFields.businessName || '',
        address: additionalFields.address,
        city: additionalFields.city,
        province: additionalFields.province,
        designation: additionalFields.designation || ''
      });

      // For new non-patient users, return success but don't provide token (requires admin verification)
      if (userRole !== 'patient') {
        return res.status(200).json({ 
          message: 'Registration successful! Please wait for admin verification before you can log in.',
          requiresVerification: true,
          user: {
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    } else {
      // Gate unverified providers (only for existing users)
      if (user.role !== 'patient' && !user.isVerified) {
        return res.status(403).json({ message: 'Account not verified by admin' });
      }
    }

    // Only generate token for patients or verified users
    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ token, user: userObj });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(400).json({ message: err?.message || 'Google login failed' });
  }
};


