import express from 'express';
import { 
  getAllPatients,
  getMedications,
  addMedication,
  administerMedication,
  getPatientCareData
} from '../controllers/nurseController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and nurse role
router.use(verifyToken);
router.use(authorizeRole('nurse'));

// Nurse routes
router.get('/patients', getAllPatients);
router.get('/medications', getMedications);
router.post('/medications', addMedication);
router.put('/medications/:id/administer', administerMedication);
router.get('/patient-care-data', getPatientCareData);

export default router;
