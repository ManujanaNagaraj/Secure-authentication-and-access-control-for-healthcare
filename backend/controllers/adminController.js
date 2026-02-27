import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import { createAuditLog } from '../middleware/auditLogger.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    // Get counts by role
    const totalUsers = users.length;
    const totalPatients = users.filter(u => u.role === 'patient').length;
    const totalDoctors = users.filter(u => u.role === 'doctor').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    res.status(200).json({
      success: true,
      count: totalUsers,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAdmins
      },
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be patient, doctor, or admin'
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete related records if needed
    if (user.role === 'patient') {
      await MedicalRecord.deleteMany({ patientId: id });
      await Appointment.deleteMany({ patientId: id });
    } else if (user.role === 'doctor') {
      await MedicalRecord.deleteMany({ doctorId: id });
      await Appointment.deleteMany({ doctorId: id });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRecords = await MedicalRecord.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    const scheduledAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          admins: totalAdmins
        },
        records: {
          total: totalRecords
        },
        appointments: {
          total: totalAppointments,
          scheduled: scheduledAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};

// @desc    Get security alerts (placeholder)
// @route   GET /api/admin/security-alerts
// @access  Private (Admin only)
export const getSecurityAlerts = async (req, res) => {
  try {
    // Get all flagged audit logs that are not resolved
    const alerts = await AuditLog.find({ 
      flagged: true 
    })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      type: alert.resolved ? 'resolved' : 'warning',
      userId: alert.userId?._id,
      userName: alert.userName || alert.userId?.name || 'Unknown',
      userEmail: alert.userId?.email,
      role: alert.role,
      action: alert.action,
      endpoint: alert.endpoint,
      ipAddress: alert.ipAddress,
      message: alert.flagReason,
      timestamp: alert.timestamp,
      severity: alert.flagReason.includes('Brute force') ? 'high' : 
                alert.flagReason.includes('rapid') ? 'high' : 'medium',
      flagged: alert.flagged,
      resolved: alert.resolved
    }));

    res.status(200).json({
      success: true,
      count: formattedAlerts.length,
      data: formattedAlerts
    });
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching security alerts',
      error: error.message
    });
  }
};

// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin only)
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
};

// @desc    Mark alert as resolved
// @route   DELETE /api/admin/alerts/:id
// @access  Private (Admin only)
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await AuditLog.findByIdAndUpdate(
      id,
      { resolved: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};
