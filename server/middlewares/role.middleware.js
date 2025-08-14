// Role middleware for consistent role validation
export const validateRole = (req, res, next) => {
  const { role } = req.body;
  const allowedRoles = ['patient', 'doctor', 'clinic/hospital', 'laboratory', 'pharmacy'];
  
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  next();
};

// Middleware to check if user has required role
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!requiredRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Export allowed roles for consistency
export const ALLOWED_ROLES = ['patient', 'doctor', 'clinic/hospital', 'laboratory', 'pharmacy'];
