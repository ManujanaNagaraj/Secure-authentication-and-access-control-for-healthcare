import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';

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
    // Placeholder for security alerts
    // In a real system, this would check logs, failed login attempts, etc.
    const alerts = [
      {
        id: 1,
        type: 'info',
        message: 'System is operating normally',
        timestamp: new Date(),
        severity: 'low'
      }
    ];

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
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
