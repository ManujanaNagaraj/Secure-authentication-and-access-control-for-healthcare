import express from 'express';
import { 
  getMyPatients,
  getPatientRecords,
  addMedicalRecord,
  getMyAppointments,
  updateAppointmentStatus
} from '../controllers/doctorController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(verifyToken);
router.use(authorizeRole('doctor'));

// Doctor routes
router.get('/my-patients', getMyPatients);
router.get('/patients/:patientId/records', getPatientRecords);
router.post('/add-record', addMedicalRecord);
router.get('/appointments', getMyAppointments);
router.put('/appointments/:id', updateAppointmentStatus);

export default router;
