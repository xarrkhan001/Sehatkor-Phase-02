import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getClientBaseUrl() {
  // Prefer explicit env, else fall back to typical dev ports
  return process.env.CLIENT_URL || 'http://localhost:8080';
}

function getGraphVersion() {
  return process.env.FACEBOOK_GRAPH_VERSION || 'v19.0';
}

function buildFacebookAuthUrl(role) {
  const graphVer = getGraphVersion();
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID || '',
    redirect_uri: process.env.FACEBOOK_CALLBACK_URL || '',
    response_type: 'code',
    scope: 'public_profile,email',
    state: Buffer.from(JSON.stringify({ r: role || 'patient' })).toString('base64'),
  });
  return `https://www.facebook.com/${graphVer}/dialog/oauth?${params.toString()}`;
}

export async function facebookStart(req, res) {
  try {
    const { role } = req.query || {};
    const authUrl = buildFacebookAuthUrl(role);
    return res.redirect(authUrl);
  } catch (err) {
    console.error('Facebook start error:', err);
    return res.status(400).json({ message: err?.message || 'Failed to start Facebook login' });
  }
}

export async function facebookCallback(req, res) {
  try {
    const { code, state } = req.query || {};
    if (!code) {
      return res.status(400).json({ message: 'Missing code' });
    }

    let role = 'patient';
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(String(state), 'base64').toString('utf8'));
        if (parsed?.r && typeof parsed.r === 'string') role = parsed.r;
      } catch {}
    }

    const tokenParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || '',
      redirect_uri: process.env.FACEBOOK_CALLBACK_URL || '',
      client_secret: process.env.FACEBOOK_APP_SECRET || '',
      code: String(code),
    });

    const graphVer = getGraphVersion();
    const tokenRes = await fetch(`https://graph.facebook.com/${graphVer}/oauth/access_token?${tokenParams.toString()}`);
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      throw new Error(`Facebook token exchange failed: ${txt}`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) throw new Error('Missing access token');

    const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`);
    if (!profileRes.ok) {
      const txt = await profileRes.text();
      throw new Error(`Facebook profile fetch failed: ${txt}`);
    }
    const profile = await profileRes.json();

    let email = profile?.email;
    if (!email && profile?.id) {
      // Fallback when email is not returned (user hidden email or permission not granted)
      email = `${profile.id}@facebook.local`;
    }
    if (!email) throw new Error('Unable to retrieve any identifier from Facebook');

    const name = profile?.name || email.split('@')[0];
    const avatar = profile?.picture?.data?.url || undefined;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: ['patient', 'doctor', 'clinic/hospital', 'laboratory', 'pharmacy'].includes(role) ? role : 'patient',
        avatar,
        isVerified: role === 'patient',
        password: Math.random().toString(36).slice(2), // placeholder
      });
    }

    if (user.role !== 'patient' && !user.isVerified) {
      // Do not allow login for non-patient roles until admin verifies
      const clientUrl = getClientBaseUrl();
      const redirectUrl = `${clientUrl}/auth/callback?error=${encodeURIComponent('Account not verified by admin')}`;
      return res.redirect(redirectUrl);
    }

    const jwtToken = generateToken(user);
    const clientUrl = getClientBaseUrl();
    const redirectUrl = `${clientUrl}/auth/callback?token=${encodeURIComponent(jwtToken)}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Facebook callback error:', err);
    const clientUrl = getClientBaseUrl();
    const redirectUrl = `${clientUrl}/auth/callback?error=${encodeURIComponent(err?.message || 'Facebook login failed')}`;
    return res.redirect(redirectUrl);
  }
}


