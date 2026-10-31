import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sheetAgentPlanSchema, sheetAgentApplySchema } from '@algoforge/shared';
import * as sheetAgentController from '../controllers/sheetAgent.controller.js';

const router = Router();

router.use(protect);

router.post('/plan', validate(sheetAgentPlanSchema), sheetAgentController.planAction);
router.post('/apply', validate(sheetAgentApplySchema), sheetAgentController.applyAction);

export default router;
