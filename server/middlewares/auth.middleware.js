import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Expecting "Bearer TOKEN"

  if (process.env.DEBUG_AUTH === 'true') {
    console.log('Auth middleware:', {
      authHeader: authHeader ? 'Present' : 'Missing',
      token: token ? 'Present' : 'Missing',
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + '...' : 'None',
      url: req.url
    });
  }

  if (!token) {
    if (process.env.DEBUG_AUTH === 'true') console.log('No token provided');
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      if (process.env.DEBUG_AUTH === 'true') console.log('JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Validate token format (JWT should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      if (process.env.DEBUG_AUTH === 'true') console.log('Invalid JWT format - expected 3 parts, got:', tokenParts.length);
      return res.status(400).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (process.env.DEBUG_AUTH === 'true') console.log('Token decoded successfully:', { userId: decoded.id || decoded.userId, role: decoded.role });
    // Support both id and userId keys
    req.userId = decoded.id || decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (process.env.DEBUG_AUTH === 'true') {
      console.log('Token verification failed:', err.message);
      console.log('Token that failed:', token.substring(0, 50) + '...');
    }
    res.status(400).json({ message: "Invalid token", error: err.message });
  }
};

export { authMiddleware };
