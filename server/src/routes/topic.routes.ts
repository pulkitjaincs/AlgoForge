import { Router } from 'express';
import * as topicController from '../controllers/topic.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createTopicSchema, updateTopicSchema, reorderTopicsSchema } from '@algoforge/shared';

const router = Router();

router.use(protect); // All topic routes require authentication

router.get('/', topicController.getAll);
router.post('/', validate(createTopicSchema), topicController.create);
router.put('/reorder', validate(reorderTopicsSchema), topicController.reorder);
router.put('/:topicId', validate(updateTopicSchema), topicController.update);
router.delete('/:topicId', topicController.remove);

export default router;
