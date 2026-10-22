import express from 'express';
import { register, login, getMe, updateProgression } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (Requires Bearer token)
router.get('/me', protect, getMe);
router.put('/progression', protect, updateProgression);

export default router;
