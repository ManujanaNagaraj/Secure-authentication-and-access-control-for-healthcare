import PatientRecord from '../models/PatientRecord.js';
import MedicationSchedule from '../models/MedicationSchedule.js';

// @desc    Get all active patients for nursing care
// @route   GET /api/nurse/patients
// @access  Private (Nurse only)
export const getAllPatients = async (req, res) => {
  try {
    // Find all active patient records
    const patients = await PatientRecord.find({ status: 'active' })
      .populate('doctorId', 'name')
      .sort({ roomNumber: 1 });

    // Format the response with patient care data
    const formattedPatients = patients.map(patient => ({
      _id: patient._id,
      patientName: patient.patientName,
      age: patient.patientAge,
      roomNumber: patient.roomNumber,
      doctorName: patient.doctorId?.name || 'N/A',
      currentStatus: patient.status,
      diagnosis: patient.diagnosis,
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

// @desc    Get today's medication schedule
// @route   GET /api/nurse/medications
// @access  Private (Nurse only)
export const getMedications = async (req, res) => {
  try {
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all medications scheduled for today
    const medications = await MedicationSchedule.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('patientRecordId', 'patientName roomNumber')
      .populate('nurseId', 'name')
      .sort({ scheduledTime: 1 });

    // Format the response
    const formattedMedications = medications.map(med => ({
      _id: med._id,
      patientName: med.patientName,
      roomNumber: med.patientRecordId?.roomNumber || 'N/A',
      medication: med.medication,
      dosage: med.dosage,
      scheduledTime: med.scheduledTime,
      administered: med.administered,
      administeredBy: med.nurseId?.name || null,
      administeredAt: med.administeredAt
    }));

    res.status(200).json({
      success: true,
      count: formattedMedications.length,
      data: formattedMedications
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medications',
      error: error.message
    });
  }
};

// @desc    Add new medication schedule
// @route   POST /api/nurse/medications
// @access  Private (Nurse only)
export const addMedication = async (req, res) => {
  try {
    const { patientRecordId, patientName, medication, dosage, scheduledTime } = req.body;

    if (!patientRecordId || !patientName || !medication || !dosage || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: patientRecordId, patientName, medication, dosage, scheduledTime'
      });
    }

    // Create new medication schedule
    const medicationSchedule = await MedicationSchedule.create({
      patientRecordId,
      patientName,
      medication,
      dosage,
      scheduledTime,
      administered: false,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Medication schedule added successfully',
      data: medicationSchedule
    });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medication',
      error: error.message
    });
  }
};

// @desc    Mark medication as administered
// @route   PUT /api/nurse/medications/:id/administer
// @access  Private (Nurse only)
export const administerMedication = async (req, res) => {
  try {
    const { id } = req.params;

    const medication = await MedicationSchedule.findById(id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication schedule not found'
      });
    }

    medication.administered = true;
    medication.administeredAt = new Date();
    medication.nurseId = req.user.userId;
    await medication.save();

    res.status(200).json({
      success: true,
      message: 'Medication marked as administered',
      data: medication
    });
  } catch (error) {
    console.error('Error administering medication:', error);
    res.status(500).json({
      success: false,
      message: 'Error administering medication',
      error: error.message
    });
  }
};

// @desc    Get patient care data for chat context
// @route   GET /api/nurse/patient-care-data
// @access  Private (Nurse only)
export const getPatientCareData = async (req, res) => {
  try {
    const patients = await PatientRecord.find({ status: 'active' })
      .select('patientName roomNumber diagnosis lastCheckup');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const medications = await MedicationSchedule.find({
      date: { $gte: today, $lt: tomorrow }
    }).select('patientName medication dosage scheduledTime administered');

    res.status(200).json({
      success: true,
      data: {
        patients,
        medications
      }
    });
  } catch (error) {
    console.error('Error fetching patient care data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient care data',
      error: error.message
    });
  }
};
