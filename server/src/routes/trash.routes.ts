import { Router } from 'express';
import { getTrash, restore, permanentDelete } from '../controllers/trash.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All trash routes require authentication

router.get('/', getTrash);
router.patch('/:id/restore', restore);
router.delete('/:id', permanentDelete);

export default router;
