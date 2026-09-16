import { Router } from 'express';
import * as sheetController from '../controllers/sheet.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { publishSheetSchema } from '@algoforge/shared';
import { publishLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/publish', protect, publishLimiter, validate(publishSheetSchema), sheetController.publishSheet);
router.get('/', sheetController.getPublicSheets);
router.get('/:id', sheetController.getSheetById);
router.post('/:id/clone', protect, sheetController.cloneSheet);

export default router;
