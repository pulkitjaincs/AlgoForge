import { Router } from 'express';
import * as practiceController from '../controllers/practice.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/daily', practiceController.getDailyPlan);

export default router;
