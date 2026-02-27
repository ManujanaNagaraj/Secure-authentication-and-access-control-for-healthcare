import AuditLog from '../models/AuditLog.js';

// Helper to get client IP
const getClientIp = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'Unknown';
};

// Check 1: Brute Force Login Detection
export const checkBruteForceLogin = async (ipAddress) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const failedAttempts = await AuditLog.countDocuments({
      ipAddress,
      action: 'FAILED_LOGIN',
      timestamp: { $gte: tenMinutesAgo }
    });

    if (failedAttempts >= 5) {
      // Flag this attempt
      await AuditLog.create({
        ipAddress,
        action: 'FAILED_LOGIN',
        endpoint: 'POST /api/auth/login',
        flagged: true,
        flagReason: 'Brute force login attempt detected',
        userName: 'Unknown',
        role: 'unknown',
        timestamp: new Date()
      });

      console.warn(`⚠️  ANOMALY DETECTED: Brute force login attempt from IP ${ipAddress}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking brute force:', error);
    return false;
  }
};

// Check 2: Excessive Record Access
export const checkExcessiveRecordAccess = async (userId) => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recordAccesses = await AuditLog.find({
      userId,
      action: 'VIEW_RECORD',
      timestamp: { $gte: oneHourAgo }
    });

    // Count unique patient records accessed
    const uniqueRecords = new Set(recordAccesses.map(log => log.endpoint)).size;

    if (uniqueRecords > 15) {
      const user = recordAccesses[0];
      
      await AuditLog.create({
        userId,
        userName: user.userName,
        role: user.role,
        action: 'VIEW_RECORD',
        endpoint: 'Anomaly Detection',
        ipAddress: user.ipAddress,
        flagged: true,
        flagReason: 'Unusual patient record access frequency detected',
        timestamp: new Date()
      });

      console.warn(`⚠️  ANOMALY DETECTED: Excessive record access by user ${user.userName} (${uniqueRecords} records in 1 hour)`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking excessive record access:', error);
    return false;
  }
};

// Check 3: Off-hours Access
export const checkOffHoursAccess = async (req) => {
  try {
    const currentHour = new Date().getHours();
    
    // Check if access is between 11 PM (23) and 5 AM (5)
    if (currentHour >= 23 || currentHour < 5) {
      const ipAddress = getClientIp(req);
      
      // Only flag if this is a significant action
      const significantActions = ['ADD_RECORD', 'ROLE_CHANGE', 'DELETE_USER', 'VIEW_RECORD'];
      const action = req.auditAction;
      
      if (significantActions.includes(action)) {
        await AuditLog.create({
          userId: req.user?.userId,
          userName: req.user?.userName || 'Unknown',
          role: req.user?.role || 'unknown',
          action,
          endpoint: `${req.method} ${req.path}`,
          ipAddress,
          flagged: true,
          flagReason: 'System accessed during unusual hours',
          timestamp: new Date()
        });

        console.warn(`⚠️  ANOMALY DETECTED: Off-hours access by ${req.user?.userName} at ${new Date().toLocaleTimeString()}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking off-hours access:', error);
    return false;
  }
};

// Check 4: Rapid Role Changes
export const checkRapidRoleChanges = async (userId) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const roleChanges = await AuditLog.countDocuments({
      userId,
      action: 'ROLE_CHANGE',
      timestamp: { $gte: thirtyMinutesAgo }
    });

    if (roleChanges > 5) {
      const user = await AuditLog.findOne({ userId }).sort({ timestamp: -1 });
      
      await AuditLog.create({
        userId,
        userName: user?.userName || 'Unknown',
        role: user?.role || 'admin',
        action: 'ROLE_CHANGE',
        endpoint: 'Anomaly Detection',
        ipAddress: user?.ipAddress || 'Unknown',
        flagged: true,
        flagReason: 'Suspicious rapid role modification detected',
        timestamp: new Date()
      });

      console.warn(`⚠️  ANOMALY DETECTED: Rapid role changes by ${user?.userName} (${roleChanges} changes in 30 minutes)`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking rapid role changes:', error);
    return false;
  }
};

// Main anomaly detection middleware
export const anomalyDetector = async (req, res, next) => {
  try {
    // Skip for non-authenticated requests
    if (!req.user) {
      return next();
    }

    // Run off-hours check for all authenticated requests
    await checkOffHoursAccess(req);

    // Run specific checks based on action
    const action = req.auditAction;
    
    if (action === 'VIEW_RECORD' && req.user.role === 'doctor') {
      await checkExcessiveRecordAccess(req.user.userId);
    }
    
    if (action === 'ROLE_CHANGE' && req.user.role === 'admin') {
      await checkRapidRoleChanges(req.user.userId);
    }

    next();
  } catch (error) {
    console.error('Anomaly detector error:', error);
    // Don't block the request if anomaly detection fails
    next();
  }
};
