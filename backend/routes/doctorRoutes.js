import express from 'express';
import { 
  getMyPatients,
  addPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
  getPatientRecord,
  getAllMyPatientRecords
} from '../controllers/doctorController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(verifyToken);
router.use(authorizeRole('doctor'));

// Doctor routes
router.get('/patients', getMyPatients);
router.post('/add-record', addPatientRecord);
router.get('/record/:id', getPatientRecord);
router.put('/update-record/:id', updatePatientRecord);
router.delete('/delete-record/:id', deletePatientRecord);
router.get('/all-records', getAllMyPatientRecords);

export default router;
