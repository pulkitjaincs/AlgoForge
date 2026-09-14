import { Router } from 'express';
import * as contestController from '../controllers/contest.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Publicly browse upcoming contests
router.get('/', contestController.getContests);

// Get authenticated user's contest rating history & standings
router.get('/ratings', protect, contestController.getUserContestRatings);

export default router;
