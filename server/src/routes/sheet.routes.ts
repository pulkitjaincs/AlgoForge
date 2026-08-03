import { Router } from 'express';
import * as sheetController from '../controllers/sheet.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { publishSheetSchema } from '@algoforge/shared';

const router = Router();

router.post('/publish', protect, validate(publishSheetSchema), sheetController.publishSheet);
router.get('/', sheetController.getPublicSheets);
router.get('/:id', sheetController.getSheetById);

export default router;
