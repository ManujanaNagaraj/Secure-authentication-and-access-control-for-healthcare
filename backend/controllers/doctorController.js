import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Get doctor's patients
// @route   GET /api/doctor/my-patients
// @access  Private (Doctor only)
export const getMyPatients = async (req, res) => {
  try {
    // Find all unique patients who have records or appointments with this doctor
    const recordPatients = await MedicalRecord.find({ doctorId: req.user.userId })
      .distinct('patientId');
    
    const appointmentPatients = await Appointment.find({ doctorId: req.user.userId })
      .distinct('patientId');

    // Combine and get unique patient IDs
    const patientIds = [...new Set([...recordPatients, ...appointmentPatients])];

    // Get patient details
    const patients = await User.find({ 
      _id: { $in: patientIds },
      role: 'patient'
    }).select('name email createdAt');

    // Get last visit for each patient
    const patientsWithLastVisit = await Promise.all(
      patients.map(async (patient) => {
        const lastRecord = await MedicalRecord.findOne({ 
          patientId: patient._id,
          doctorId: req.user.userId 
        }).sort({ createdAt: -1 });

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          age: calculateAge(patient.createdAt), // Placeholder calculation
          lastVisit: lastRecord ? lastRecord.createdAt : null,
          recordCount: await MedicalRecord.countDocuments({ 
            patientId: patient._id,
            doctorId: req.user.userId 
          })
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientsWithLastVisit.length,
      data: patientsWithLastVisit
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

// @desc    Get patient's medical records (for doctor)
// @route   GET /api/doctor/patients/:patientId/records
// @access  Private (Doctor only)
export const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    const records = await MedicalRecord.find({ 
      patientId,
      doctorId: req.user.userId 
    })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
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

// @desc    Add medical record for a patient
// @route   POST /api/doctor/add-record
// @access  Private (Doctor only)
export const addMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, prescription, notes } = req.body;

    if (!patientId || !diagnosis || !prescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID, diagnosis, and prescription'
      });
    }

    // Verify patient exists and has patient role
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user.userId,
      diagnosis,
      prescription,
      notes: notes || ''
    });

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: populatedRecord
    });
  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medical record',
      error: error.message
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.userId })
      .populate('patientId', 'name email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id
// @access  Private (Doctor only)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctorId: req.user.userId },
      { status },
      { new: true }
    ).populate('patientId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// Helper function to calculate age (placeholder)
function calculateAge(createdAt) {
  // This is a placeholder - in real app, you'd have actual birthdate
  const years = Math.floor(Math.random() * 50) + 20;
  return years;
}
