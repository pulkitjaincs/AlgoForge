import { Router } from 'express';
import * as subtopicController from '../controllers/subtopic.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createSubTopicSchema, updateSubTopicSchema, reorderSubTopicsSchema } from '@algoforge/shared';

const router = Router({ mergeParams: true });

router.post('/topics/:topicId/subtopics', protect, validate(createSubTopicSchema), subtopicController.create);
router.put('/topics/:topicId/subtopics/reorder', protect, validate(reorderSubTopicsSchema), subtopicController.reorder);
router.put('/subtopics/:subTopicId', protect, validate(updateSubTopicSchema), subtopicController.update);
router.delete('/subtopics/:subTopicId', protect, subtopicController.remove);

export default router;
