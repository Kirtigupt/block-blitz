import express from 'express';
import { saveGame, getMyHistory, getMyStats } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All game endpoints require authentication
router.use(protect);

router.post('/', saveGame);
router.get('/my-history', getMyHistory);
router.get('/my-stats', getMyStats);

export default router;
