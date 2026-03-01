import mongoose from 'mongoose';

const patientRecordSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientAge: {
    type: Number,
    required: [true, 'Patient age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age must be valid']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required']
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  prescription: {
    type: String,
    required: [true, 'Prescription is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'discharged'],
      message: 'Status must be either active or discharged'
    },
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastCheckup: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
patientRecordSchema.index({ doctorId: 1, status: 1 });
patientRecordSchema.index({ status: 1 });
patientRecordSchema.index({ roomNumber: 1 });

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);

export default PatientRecord;
