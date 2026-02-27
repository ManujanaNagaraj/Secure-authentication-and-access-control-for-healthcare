import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow for failed login attempts where user might not exist
  },
  userName: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'unknown'],
    default: 'unknown'
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'FAILED_LOGIN',
      'LOGOUT',
      'VIEW_RECORD',
      'ADD_RECORD',
      'VIEW_PATIENTS',
      'VIEW_APPOINTMENTS',
      'ROLE_CHANGE',
      'DELETE_USER',
      'VIEW_USERS',
      'VIEW_PROFILE',
      'REGISTER',
      'CHAT_AI',
      'OTHER'
    ]
  },
  endpoint: {
    type: String,
    required: [true, 'Endpoint is required']
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    default: ''
  },
  resolved: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Index for faster queries
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ flagged: 1, resolved: 1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
