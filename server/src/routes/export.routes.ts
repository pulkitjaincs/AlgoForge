import { Router } from 'express';
import * as exportController from '../controllers/export.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, exportController.requestExport);
router.get('/download', protect, exportController.downloadExport);

export default router;
