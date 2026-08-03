import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { updateProfileSchema } from '@algoforge/shared';

const router = Router();

router.patch('/me/profile', protect, validate(updateProfileSchema), userController.updateProfile);
router.get('/:username/profile', userController.getPublicProfile);

export default router;
