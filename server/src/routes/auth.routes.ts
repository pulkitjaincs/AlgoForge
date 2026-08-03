import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '@algoforge/shared';
import rateLimit from 'express-rate-limit';

const router = Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', strictLimiter, validate(registerSchema), authController.register);
router.post('/login', strictLimiter, validate(loginSchema), authController.login);
router.post('/refresh', strictLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
