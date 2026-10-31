import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { socraticHintSchema } from '@algoforge/shared';

const router = Router();

router.use(protect);

router.get('/coach', aiController.getCoachPlan);
router.post('/hint', validate(socraticHintSchema), aiController.getHint);

export default router;
