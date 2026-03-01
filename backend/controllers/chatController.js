import { GoogleGenerativeAI } from '@google/generative-ai';
import PatientRecord from '../models/PatientRecord.js';
import MedicationSchedule from '../models/MedicationSchedule.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Chat with AI healthcare assistant (role-based)
// @route   POST /api/chat
// @access  Private (Doctor, Nurse, Admin)
export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userRole = req.user.role;

    console.log('[chatWithBot] User:', req.user.userName, 'Role:', userRole);
    console.log('[chatWithBot] Message:', message);

    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Invalid or missing Gemini API key. Please check your configuration.'
      });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let systemPrompt = '';

    // Build role-specific system prompt
    if (userRole === 'doctor') {
      // Fetch doctor's patient records
      const patientRecords = await PatientRecord.find({ doctorId: req.user.userId })
        .select('patientName patientAge diagnosis prescription notes roomNumber status')
        .limit(20);

      let recordsContext = 'No patients assigned yet.';
      if (patientRecords.length > 0) {
        recordsContext = patientRecords.map((record, index) => {
          return `Patient ${index + 1}: ${record.patientName} (Age: ${record.patientAge})
- Room: ${record.roomNumber}
- Diagnosis: ${record.diagnosis}
- Prescription: ${record.prescription}
- Status: ${record.status}`;
        }).join('\n\n');
      }

      systemPrompt = `You are DocBot, an AI assistant for doctors. You have access to all patient records assigned to this doctor:

${recordsContext}

Help with:
- Diagnosis suggestions and differential diagnosis
- Medication information and drug interactions
- Patient history analysis and pattern recognition
- Clinical decision support and treatment recommendations
- Medical literature and evidence-based medicine
- Lab result interpretation

IMPORTANT: Only answer medical and patient-related questions. If asked about anything else, politely decline and redirect to medical topics.

Doctor's question: ${message}

Provide a professional, evidence-based response:`;

    } else if (userRole === 'nurse') {
      // Fetch patient care data
      const patients = await PatientRecord.find({ status: 'active' })
        .select('patientName roomNumber diagnosis lastCheckup')
        .limit(20);

      // Fetch today's medications
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const medications = await MedicationSchedule.find({
        date: { $gte: today, $lt: tomorrow }
      }).select('patientName medication dosage scheduledTime administered');

      let patientData = 'No active patients.';
      if (patients.length > 0) {
        patientData = patients.map((p, i) => {
          return `${i + 1}. ${p.patientName} - Room ${p.roomNumber}
   Diagnosis: ${p.diagnosis}
   Last Checkup: ${new Date(p.lastCheckup).toLocaleDateString()}`;
        }).join('\n');
      }

      let medicationsData = 'No medications scheduled for today.';
      if (medications.length > 0) {
        medicationsData = medications.map((m, i) => {
          return `${i + 1}. ${m.patientName} - ${m.medication} ${m.dosage} at ${m.scheduledTime}
   Status: ${m.administered ? 'Administered' : 'Pending'}`;
        }).join('\n');
      }

      systemPrompt = `You are NurseBot, an AI assistant for nurses. You have access to today's patient care data and medication schedule:

ACTIVE PATIENTS:
${patientData}

TODAY'S MEDICATION SCHEDULE:
${medicationsData}

Help with:
- Medication reminders and administration procedures
- Patient care procedures and nursing protocols
- Vital signs monitoring and assessment
- Shift handover summaries
- Wound care and basic procedures
- Patient safety and infection control

IMPORTANT: Only answer patient care related questions. If asked about anything else, politely decline and redirect to nursing care topics.

Nurse's question: ${message}

Provide a helpful, procedure-focused response:`;

    } else if (userRole === 'admin') {
      // Fetch system data
      const users = await User.find().select('name email role createdAt').limit(50);
      const allRecords = await PatientRecord.find()
        .populate('doctorId', 'name')
        .select('patientName diagnosis prescription status createdAt')
        .limit(30);
      const alerts = await AuditLog.find({ flagged: true, resolved: false })
        .select('action userName role flagReason timestamp')
        .limit(20);

      let usersData = users.map((u, i) => `${i + 1}. ${u.name} (${u.role}) - ${u.email}`).join('\n');
      let recordsData = allRecords.map((r, i) => {
        return `${i + 1}. Patient: ${r.patientName}
   Doctor: ${r.doctorId?.name || 'Unassigned'}
   Diagnosis: ${r.diagnosis}
   Status: ${r.status}`;
      }).join('\n');
      let alertsData = alerts.length > 0 
        ? alerts.map((a, i) => `${i + 1}. ${a.action} by ${a.userName} (${a.role}) - ${a.flagReason}`).join('\n')
        : 'No security alerts';

      systemPrompt = `You are AdminBot, an AI assistant for hospital administrators. You have access to all system data:

USERS (${users.length} total):
${usersData}

PATIENT RECORDS (${allRecords.length} total):
${recordsData}

SECURITY ALERTS:
${alertsData}

Help with:
- System statistics and data analysis
- User management queries and role assignments
- Security analysis and threat identification
- Hospital operations and workflow optimization
- Compliance and audit reporting
- Resource allocation and planning

Answer any administrative or medical records related questions with full system visibility.

Administrator's question: ${message}

Provide a comprehensive, data-driven response:`;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for chat access'
      });
    }

    console.log('[chatWithBot] Sending request to Gemini API...');

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const botResponse = response.text();

    console.log('[chatWithBot] Gemini response received');

    res.status(200).json({
      success: true,
      message: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[chatWithBot] ERROR:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'Invalid or missing Gemini API key. Please check your configuration.'
      });
    }

    if (error.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error communicating with AI assistant. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
