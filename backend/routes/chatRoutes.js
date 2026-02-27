import express from 'express';
import { chatWithBot } from '../controllers/chatController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All routes require authentication and patient role
router.use(verifyToken);
router.use(authorizeRole('patient'));

// Chat routes
router.post('/', chatWithBot);

export default router;
