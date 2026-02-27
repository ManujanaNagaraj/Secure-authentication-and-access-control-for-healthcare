import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    console.log('[verifyToken] Path:', req.path);
    console.log('[verifyToken] Headers:', req.headers.authorization ? 'Token present' : 'No token');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[verifyToken] ERROR: No valid authorization header');
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('[verifyToken] ERROR: Token extraction failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[verifyToken] Token decoded successfully for userId:', decoded.userId);

    // Get user details for audit logging
    const user = await User.findById(decoded.userId).select('name email role');

    if (!user) {
      console.log('[verifyToken] ERROR: User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      userName: user.name || 'Unknown',
      userEmail: user.email
    };

    console.log('[verifyToken] Authentication successful for user:', req.user.userName);
    next();
  } catch (error) {
    console.error('[verifyToken] ERROR:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authorization denied.'
      });
    }

    console.error('[verifyToken] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: error.message
    });
  }
};
