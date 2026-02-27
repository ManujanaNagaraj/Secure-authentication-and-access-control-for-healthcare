import express from 'express';
import { 
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats,
  getSecurityAlerts
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(verifyToken);
router.use(authorizeRole('admin'));

// Admin routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);
router.get('/security-alerts', getSecurityAlerts);

export default router;
