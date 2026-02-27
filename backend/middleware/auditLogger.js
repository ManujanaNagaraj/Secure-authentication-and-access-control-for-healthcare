import AuditLog from '../models/AuditLog.js';

// Map HTTP methods and endpoints to actions
const getActionFromRequest = (method, path) => {
  // Login/Auth actions
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/register')) return 'REGISTER';
  if (path.includes('/auth/profile')) return 'VIEW_PROFILE';
  
  // Patient actions
  if (path.includes('/patients/my-records')) return 'VIEW_RECORD';
  if (path.includes('/patients/my-appointments')) return 'VIEW_APPOINTMENTS';
  
  // Chat actions
  if (path.includes('/chat')) return 'CHAT_AI';
  
  // Doctor actions
  if (path.includes('/doctor/my-patients')) return 'VIEW_PATIENTS';
  if (path.includes('/doctor/add-record')) return 'ADD_RECORD';
  if (path.includes('/doctor/patients') && path.includes('/records')) return 'VIEW_RECORD';
  
  // Admin actions
  if (path.includes('/admin/users') && method === 'GET') return 'VIEW_USERS';
  if (path.includes('/admin/users') && path.includes('/role')) return 'ROLE_CHANGE';
  if (path.includes('/admin/users') && method === 'DELETE') return 'DELETE_USER';
  
  return 'OTHER';
};

// Get client IP address
const getClientIp = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'Unknown';
};

export const auditLogger = async (req, res, next) => {
  try {
    // Skip logging for health check and static files
    if (req.path === '/health' || req.path.includes('/assets/')) {
      return next();
    }

    const action = getActionFromRequest(req.method, req.path);
    const ipAddress = getClientIp(req);

    // Create audit log entry
    const logEntry = {
      userId: req.user?.userId || null,
      userName: req.user?.userName || 'Anonymous',
      role: req.user?.role || 'unknown',
      action,
      endpoint: `${req.method} ${req.path}`,
      ipAddress,
      timestamp: new Date(),
      flagged: false,
      flagReason: '',
      metadata: {
        userAgent: req.headers['user-agent'],
        method: req.method
      }
    };

    // Save audit log asynchronously (don't wait for it)
    AuditLog.create(logEntry).catch(err => {
      console.error('Error creating audit log:', err);
    });

    next();
  } catch (error) {
    console.error('Audit logger error:', error);
    // Don't block the request if audit logging fails
    next();
  }
};

// Helper function to create a log entry from controllers
export const createAuditLog = async (logData) => {
  try {
    await AuditLog.create(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};
