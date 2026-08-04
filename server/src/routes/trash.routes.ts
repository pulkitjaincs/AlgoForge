import { Router } from 'express';
import { getTrash, restore, permanentDelete } from '../controllers/trash.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { trashActionSchema } from '@algoforge/shared';

const router = Router();

router.use(protect); // All trash routes require authentication

router.get('/', getTrash);
router.patch('/:id/restore', validate(trashActionSchema), restore);
router.delete('/:id', validate(trashActionSchema), permanentDelete);

export default router;
