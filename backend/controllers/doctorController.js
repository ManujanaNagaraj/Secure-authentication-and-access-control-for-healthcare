import PatientRecord from '../models/PatientRecord.js';
import User from '../models/User.js';

// @desc    Get doctor's patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
export const getMyPatients = async (req, res) => {
  try {
    // Find all active patient records assigned to this doctor
    const patients = await PatientRecord.find({ 
      doctorId: req.user.userId,
      status: 'active'
    })
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    // Format the response with diagnosis history
    const formattedPatients = patients.map(patient => ({
      _id: patient._id,
      patientName: patient.patientName,
      age: patient.patientAge,
      roomNumber: patient.roomNumber,
      diagnosisHistory: patient.diagnosis,
      prescription: patient.prescription,
      notes: patient.notes,
      status: patient.status,
      lastCheckup: patient.lastCheckup,
      createdAt: patient.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedPatients.length,
      data: formattedPatients
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

// @desc    Add medical record for a patient
// @route   POST /api/doctor/add-record
// @access  Private (Doctor only)
export const addPatientRecord = async (req, res) => {
  try {
    const { patientName, patientAge, roomNumber, diagnosis, prescription, notes } = req.body;

    if (!patientName || !patientAge || !roomNumber || !diagnosis || !prescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: patientName, patientAge, roomNumber, diagnosis, prescription'
      });
    }

    // Create new patient record
    const patientRecord = await PatientRecord.create({
      patientName,
      patientAge,
      roomNumber,
      doctorId: req.user.userId,
      diagnosis,
      prescription,
      notes: notes || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Patient record added successfully',
      data: patientRecord
    });
  } catch (error) {
    console.error('Error adding patient record:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding patient record',
      error: error.message
    });
  }
};

// @desc    Update patient record
// @route   PUT /api/doctor/patients/:id
// @access  Private (Doctor only)
export const updatePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find patient record and ensure it belongs to this doctor
    const patientRecord = await PatientRecord.findOne({
      _id: id,
      doctorId: req.user.userId
    });

    if (!patientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found or you do not have permission to update it'
      });
    }

    // Update the record
    Object.assign(patientRecord, updates);
    patientRecord.lastCheckup = new Date();
    await patientRecord.save();

    res.status(200).json({
      success: true,
      message: 'Patient record updated successfully',
      data: patientRecord
    });
  } catch (error) {
    console.error('Error updating patient record:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient record',
      error: error.message
    });
  }
};

// @desc    Get all patient records (for chat context)
// @route   GET /api/doctor/all-records
// @access  Private (Doctor only)
export const getAllMyPatientRecords = async (req, res) => {
  try {
    const records = await PatientRecord.find({ 
      doctorId: req.user.userId 
    }).select('patientName patientAge diagnosis prescription notes status roomNumber');

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message
    });
  }
};
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
