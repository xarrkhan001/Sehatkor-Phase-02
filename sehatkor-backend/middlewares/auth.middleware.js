import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer TOKEN"

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support both id and userId keys
    req.userId = decoded.id || decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export { authMiddleware };
