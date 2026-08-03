import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createGroupSchema, joinGroupSchema } from '@algoforge/shared';

const router = Router();

router.use(protect);

router.post('/', validate(createGroupSchema), groupController.createGroup);
router.post('/join', validate(joinGroupSchema), groupController.joinGroup);
router.get('/:id', groupController.getGroup);

export default router;
