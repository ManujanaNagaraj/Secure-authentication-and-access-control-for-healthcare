import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';

// @desc    Get patient's medical records
// @route   GET /api/patients/my-records
// @access  Private (Patient only)
export const getMyRecords = async (req, res) => {
  try {
    console.log('[getMyRecords] Fetching records for patient:', req.user.userId);
    console.log('[getMyRecords] User info:', req.user);
    
    const records = await MedicalRecord.find({ patientId: req.user.userId })
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    console.log('[getMyRecords] Found', records.length, 'records');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('[getMyRecords] ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/patients/my-appointments
// @access  Private (Patient only)
export const getMyAppointments = async (req, res) => {
  try {
    console.log('[getMyAppointments] Fetching appointments for patient:', req.user.userId);
    
    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate('doctorId', 'name email')
      .sort({ date: 1 });

    console.log('[getMyAppointments] Found', appointments.length, 'appointments');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('[getMyAppointments] ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/patients/appointments
// @access  Private (Patient only)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, and time'
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.userId,
      doctorId,
      date,
      time,
      reason: reason || '',
      status: 'scheduled'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};
