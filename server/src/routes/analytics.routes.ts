import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/summary', analyticsController.getSummary);
router.get('/heatmap', analyticsController.getHeatmap);
router.get('/streaks', analyticsController.getStreaks);
router.get('/topic-mastery', analyticsController.getTopicMastery);
router.get('/weak-areas', analyticsController.getWeakAreas);
router.get('/velocity', analyticsController.getVelocity);

export default router;
