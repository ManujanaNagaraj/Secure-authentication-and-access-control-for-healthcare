import mongoose from 'mongoose';

const medicationScheduleSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientRecord',
    required: [true, 'Patient record ID is required']
  },
  medication: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
    trim: true
  },
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  administered: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  administeredAt: {
    type: Date
  }
});

// Index for faster queries
medicationScheduleSchema.index({ date: 1, administered: 1 });
medicationScheduleSchema.index({ nurseId: 1 });
medicationScheduleSchema.index({ patientRecordId: 1 });

const MedicationSchedule = mongoose.model('MedicationSchedule', medicationScheduleSchema);

export default MedicationSchedule;
