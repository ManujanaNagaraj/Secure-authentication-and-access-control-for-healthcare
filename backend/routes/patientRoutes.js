import express from 'express';
import { 
  getMyRecords, 
  getMyAppointments,
  createAppointment 
} from '../controllers/patientController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(verifyToken);
router.use(authorizeRole('patient'));

// Patient routes
router.get('/my-records', getMyRecords);
router.get('/my-appointments', getMyAppointments);
router.post('/appointments', createAppointment);

export default router;
