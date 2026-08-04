import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as integrationController from '../controllers/integration.controller.js';

const router = Router();

router.use(protect);

router.get('/', integrationController.getIntegrations);
router.post('/', integrationController.linkIntegration);
router.delete('/:platform', integrationController.unlinkIntegration);
router.post('/sync', integrationController.syncIntegrations);
router.get('/heatmap', integrationController.getHeatmap);

export default router;
