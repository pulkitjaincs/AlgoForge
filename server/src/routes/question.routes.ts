import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createQuestionSchema, updateNotesSchema, addAttemptSchema } from '@algoforge/shared';

const router = Router({ mergeParams: true });

router.post('/topics/:topicId/subtopics/:subTopicId/questions', protect, validate(createQuestionSchema), questionController.create);
router.patch('/questions/:questionId/solved', protect, questionController.toggleSolved);
router.put('/questions/:questionId/notes', protect, validate(updateNotesSchema), questionController.updateNotes);
router.delete('/questions/:questionId', protect, questionController.remove);
router.post('/questions/:questionId/attempts', protect, validate(addAttemptSchema), questionController.addAttempt);

export default router;
