import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { linkIntegrationSchema } from '@algoforge/shared';
import * as integrationController from '../controllers/integration.controller.js';
import { syncLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(protect);

router.get('/', integrationController.getIntegrations);
router.post('/', validate(linkIntegrationSchema), integrationController.linkIntegration);
router.delete('/:platform', integrationController.unlinkIntegration);
router.post('/sync', syncLimiter, integrationController.syncIntegrations);
router.get('/heatmap', integrationController.getHeatmap);

export default router;
