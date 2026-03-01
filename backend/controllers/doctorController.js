import PatientRecord from '../models/PatientRecord.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Get client IP helper
const getClientIp = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         'Unknown';
};

// @desc    Get doctor's patients (department-restricted)
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
export const getMyPatients = async (req, res) => {
  try {
    // Get doctor's information including specialization
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    if (!doctor || !doctor.specialization) {
      return res.status(400).json({
        success: false,
        message: 'Doctor specialization not found'
      });
    }

    // Find all active patient records in doctor's department only
    const patients = await PatientRecord.find({ 
      department: doctor.specialization,
      status: 'active'
    })
      .populate('assignedDoctorId', 'name specialization')
      .sort({ createdAt: -1 });

    // Format the response
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
      assignedDoctorName: patient.assignedDoctorName,
      department: patient.department,
      createdAt: patient.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedPatients.length,
      department: doctor.specialization,
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

// @desc    Add patient record (auto-fill department from doctor's specialization)
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

    // Get doctor's information
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    if (!doctor || !doctor.specialization) {
      return res.status(400).json({
        success: false,
        message: 'Doctor specialization not found'
      });
    }

    // Create new patient record with auto-filled fields
    const patientRecord = await PatientRecord.create({
      patientName,
      patientAge,
      roomNumber,
      doctorId: req.user.userId,
      assignedDoctorId: req.user.userId,
      assignedDoctorName: doctor.name,
      department: doctor.specialization, // Auto-filled from doctor's specialization
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

// @desc    Update patient record (only if assigned to this doctor)
// @route   PUT /api/doctor/update-record/:id
// @access  Private (Doctor only)
export const updatePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get doctor's information
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    // Find patient record
    const patientRecord = await PatientRecord.findById(id);

    if (!patientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    // Check if this doctor is assigned to this patient
    if (patientRecord.assignedDoctorId.toString() !== req.user.userId.toString()) {
      // Log unauthorized access attempt
      await AuditLog.create({
        userId: req.user.userId,
        userName: doctor.name,
        role: 'doctor',
        action: 'UNAUTHORIZED_ACCESS',
        endpoint: `PUT /api/doctor/update-record/${id}`,
        ipAddress: getClientIp(req),
        timestamp: new Date(),
        flagged: true,
        flagReason: `Unauthorized cross-department record access attempt: Dr. ${doctor.name} (${doctor.specialization}) attempted to update patient ${patientRecord.patientName} in ${patientRecord.department} department`,
        metadata: {
          attemptedAction: 'UPDATE',
          doctorSpecialization: doctor.specialization,
          targetDepartment: patientRecord.department,
          patientId: id,
          patientName: patientRecord.patientName
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update patients assigned to you'
      });
    }

    // Update allowed fields only
    const allowedUpdates = ['patientAge', 'roomNumber', 'diagnosis', 'prescription', 'notes', 'status'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        patientRecord[key] = updates[key];
      }
    });

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

// @desc    Delete patient record (only if assigned to this doctor)
// @route   DELETE /api/doctor/delete-record/:id
// @access  Private (Doctor only)
export const deletePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Get doctor's information
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    // Find patient record
    const patientRecord = await PatientRecord.findById(id);

    if (!patientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    // Check if this doctor is assigned to this patient
    if (patientRecord.assignedDoctorId.toString() !== req.user.userId.toString()) {
      // Log unauthorized access attempt
      await AuditLog.create({
        userId: req.user.userId,
        userName: doctor.name,
        role: 'doctor',
        action: 'UNAUTHORIZED_ACCESS',
        endpoint: `DELETE /api/doctor/delete-record/${id}`,
        ipAddress: getClientIp(req),
        timestamp: new Date(),
        flagged: true,
        flagReason: `Unauthorized cross-department record access attempt: Dr. ${doctor.name} (${doctor.specialization}) attempted to delete patient ${patientRecord.patientName} in ${patientRecord.department} department`,
        metadata: {
          attemptedAction: 'DELETE',
          doctorSpecialization: doctor.specialization,
          targetDepartment: patientRecord.department,
          patientId: id,
          patientName: patientRecord.patientName
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete patients assigned to you'
      });
    }

    // Delete the record
    await PatientRecord.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Patient record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient record',
      error: error.message
    });
  }
};

// @desc    Get single patient record for viewing/downloading
// @route   GET /api/doctor/record/:id
// @access  Private (Doctor only)
export const getPatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Get doctor's information
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    // Find patient record
    const patientRecord = await PatientRecord.findById(id)
      .populate('assignedDoctorId', 'name specialization');

    if (!patientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found'
      });
    }

    // Check if this doctor is assigned to this patient
    if (patientRecord.assignedDoctorId._id.toString() !== req.user.userId.toString()) {
      // Log unauthorized access attempt
      await AuditLog.create({
        userId: req.user.userId,
        userName: doctor.name,
        role: 'doctor',
        action: 'UNAUTHORIZED_ACCESS',
        endpoint: `GET /api/doctor/record/${id}`,
        ipAddress: getClientIp(req),
        timestamp: new Date(),
        flagged: true,
        flagReason: `Unauthorized cross-department record access attempt: Dr. ${doctor.name} (${doctor.specialization}) attempted to access patient ${patientRecord.patientName} in ${patientRecord.department} department`,
        metadata: {
          attemptedAction: 'VIEW',
          doctorSpecialization: doctor.specialization,
          targetDepartment: patientRecord.department,
          patientId: id,
          patientName: patientRecord.patientName
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access patients in your department'
      });
    }

    res.status(200).json({
      success: true,
      data: patientRecord
    });
  } catch (error) {
    console.error('Error fetching patient record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient record',
      error: error.message
    });
  }
};

// @desc    Get all patient records for chat context (department-restricted)
// @route   GET /api/doctor/all-records
// @access  Private (Doctor only)
export const getAllMyPatientRecords = async (req, res) => {
  try {
    // Get doctor's information
    const doctor = await User.findById(req.user.userId).select('name specialization');
    
    if (!doctor || !doctor.specialization) {
      return res.status(400).json({
        success: false,
        message: 'Doctor specialization not found'
      });
    }

    // Get records from doctor's department only
    const records = await PatientRecord.find({ 
      department: doctor.specialization 
    }).select('patientName patientAge diagnosis prescription notes status roomNumber department assignedDoctorName');

    res.status(200).json({
      success: true,
      doctorName: doctor.name,
      specialization: doctor.specialization,
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
