import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { updateProfileSchema, updateEmailSchema, updatePasswordSchema } from '@algoforge/shared';
import { publicProfileLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.patch('/me/profile', protect, validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/email', protect, validate(updateEmailSchema), userController.updateEmail);
router.patch('/me/password', protect, validate(updatePasswordSchema), userController.updatePassword);
router.get('/check-username', protect, userController.checkUsername);
router.get('/:username/profile', publicProfileLimiter, userController.getPublicProfile);

export default router;
