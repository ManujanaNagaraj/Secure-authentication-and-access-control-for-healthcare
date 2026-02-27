export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user info is attached (should be done by verifyToken middleware)
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      // User is authorized, proceed to next middleware
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization',
        error: error.message
      });
    }
  };
};
