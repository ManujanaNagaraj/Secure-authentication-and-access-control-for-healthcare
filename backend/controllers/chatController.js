import { GoogleGenerativeAI } from '@google/generative-ai';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// @desc    Chat with AI healthcare assistant
// @route   POST /api/chat
// @access  Private (Patient only)
export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    console.log('[chatWithBot] Patient:', req.user.userName, 'UserId:', req.user.userId);
    console.log('[chatWithBot] Message:', message);
    console.log('[chatWithBot] Gemini API Key exists:', !!process.env.GEMINI_API_KEY);

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

    // Initialize Gemini API (lazily to ensure env vars are loaded)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Fetch patient details
    const patient = await User.findById(req.user.userId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Fetch patient's medical records
    const medicalRecords = await MedicalRecord.find({ patientId: req.user.userId })
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch patient's appointments
    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate('doctorId', 'name')
      .sort({ date: 1 })
      .limit(10);

    // Build context from medical records
    let recordsContext = 'No medical records available.';
    if (medicalRecords.length > 0) {
      recordsContext = medicalRecords.map((record, index) => {
        const date = new Date(record.createdAt).toLocaleDateString();
        return `Record ${index + 1} (${date}):
- Doctor: ${record.doctorId?.name || 'Unknown'}
- Diagnosis: ${record.diagnosis}
- Prescription: ${record.prescription}
- Notes: ${record.notes || 'None'}`;
      }).join('\n\n');
    }

    // Build context from appointments
    let appointmentsContext = 'No upcoming appointments.';
    if (appointments.length > 0) {
      appointmentsContext = appointments.map((apt, index) => {
        const date = new Date(apt.date).toLocaleDateString();
        return `Appointment ${index + 1}:
- Date: ${date} at ${apt.time}
- Doctor: ${apt.doctorId?.name || 'Unknown'}
- Reason: ${apt.reason || 'General checkup'}
- Status: ${apt.status}`;
      }).join('\n\n');
    }

    // Build system prompt with patient context
    const systemPrompt = `You are HealthBot, a secure AI healthcare assistant for the HealthSecure platform. 

You are currently talking to: ${patient.name}

Their Medical Records:
${recordsContext}

Their Appointments:
${appointmentsContext}

IMPORTANT GUIDELINES:
- Only answer questions related to their health, medications, appointments, medical records, and general healthcare advice
- Be professional, empathetic, and concise
- If the patient asks about their specific medical records or appointments, refer to the information provided above
- If asked anything unrelated to healthcare (politics, entertainment, coding, etc.), politely decline and redirect to healthcare topics
- Do not provide medical diagnoses - always recommend consulting their doctor for serious concerns
- Keep responses under 150 words unless explaining something complex
- Be encouraging and supportive about their health journey

Patient's question: ${message}

Please provide a helpful, caring response:`;

    console.log('[chatWithBot] Sending request to Gemini API...');

    // Get Gemini model - using gemini-2.5-flash (latest stable model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const botResponse = response.text();

    console.log('[chatWithBot] Gemini response received');
    console.log('[chatWithBot] Response length:', botResponse.length, 'characters');

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
