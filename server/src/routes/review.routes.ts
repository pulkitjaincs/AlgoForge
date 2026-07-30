import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/queue', reviewController.getQueue);
router.get('/stats', reviewController.getStats);

export default router;
