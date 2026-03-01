import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import PatientRecord from '../models/PatientRecord.js';
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
    const totalDoctors = users.filter(u => u.role === 'doctor').length;
    const totalNurses = users.filter(u => u.role === 'nurse').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    res.status(200).json({
      success: true,
      count: totalUsers,
      stats: {
        totalUsers,
        totalDoctors,
        totalNurses,
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

    if (!['doctor', 'nurse', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be doctor, nurse, or admin'
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
    if (user.role === 'doctor') {
      await MedicalRecord.deleteMany({ doctorId: id });
      await Appointment.deleteMany({ doctorId: id });
      await PatientRecord.updateMany({ doctorId: id }, { $unset: { doctorId: 1 } });
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
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalNurses = await User.countDocuments({ role: 'nurse' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPatientRecords = await PatientRecord.countDocuments();
    const activePatients = await PatientRecord.countDocuments({ status: 'active' });
    const dischargedPatients = await PatientRecord.countDocuments({ status: 'discharged' });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          doctors: totalDoctors,
          nurses: totalNurses,
          admins: totalAdmins
        },
        patientRecords: {
          total: totalPatientRecords,
          active: activePatients,
          discharged: dischargedPatients
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

// @desc    Get all patient records
// @route   GET /api/admin/all-records
// @access  Private (Admin only)
export const getAllPatientRecords = async (req, res) => {
  try {
    const records = await PatientRecord.find()
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    const formattedRecords = records.map(record => ({
      _id: record._id,
      patientName: record.patientName,
      patientAge: record.patientAge,
      roomNumber: record.roomNumber,
      doctor: record.doctorId?.name || 'Unassigned',
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      notes: record.notes,
      status: record.status,
      date: record.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient records',
      error: error.message
    });
  }
};

// @desc    Get all system data for admin chat context
// @route   GET /api/admin/system-data
// @access  Private (Admin only)
export const getSystemData = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    const allRecords = await PatientRecord.find()
      .populate('doctorId', 'name')
      .select('patientName diagnosis prescription status createdAt');
    const alerts = await AuditLog.find({ flagged: true, resolved: false })
      .select('action userName role flagReason timestamp');

    res.status(200).json({
      success: true,
      data: {
        users,
        allRecords,
        alerts
      }
    });
  } catch (error) {
    console.error('Error fetching system data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system data',
      error: error.message
    });
  }
};
