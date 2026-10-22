import express from 'express';
import { getGlobalLeaderboard } from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public leaderboard route with optional auth for personal ranking highlight
router.get('/global', optionalAuth, getGlobalLeaderboard);

export default router;
