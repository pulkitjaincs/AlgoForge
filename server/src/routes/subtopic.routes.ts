import { Router } from 'express';
import * as subtopicController from '../controllers/subtopic.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createSubTopicSchema, updateSubTopicSchema, reorderSubTopicsSchema } from '@algoforge/shared';

const router = Router({ mergeParams: true });

router.use(protect);

router.post('/topics/:topicId/subtopics', validate(createSubTopicSchema), subtopicController.create);
router.put('/topics/:topicId/subtopics/reorder', validate(reorderSubTopicsSchema), subtopicController.reorder);
router.put('/subtopics/:subTopicId', validate(updateSubTopicSchema), subtopicController.update);
router.delete('/subtopics/:subTopicId', subtopicController.remove);

export default router;
