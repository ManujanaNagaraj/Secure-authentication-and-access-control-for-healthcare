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
