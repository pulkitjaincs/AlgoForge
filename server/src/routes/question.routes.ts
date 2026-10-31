import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createQuestionSchema, updateQuestionSchema, updateNotesSchema, addAttemptSchema, reorderQuestionsSchema } from '@algoforge/shared';

const router = Router({ mergeParams: true });

router.post('/topics/:topicId/subtopics/:subTopicId/questions', protect, validate(createQuestionSchema), questionController.create);
router.post('/topics/:topicId/questions', protect, validate(createQuestionSchema), questionController.create);

router.put('/topics/:topicId/subtopics/:subTopicId/questions/reorder', protect, validate(reorderQuestionsSchema), questionController.reorder);
router.put('/topics/:topicId/questions/reorder', protect, validate(reorderQuestionsSchema), questionController.reorder);
router.put('/questions/reorder', protect, validate(reorderQuestionsSchema), questionController.reorder);

router.get('/questions/:questionId', protect, questionController.getById);
router.put('/questions/:questionId', protect, validate(updateQuestionSchema), questionController.update);
router.patch('/questions/:questionId/solved', protect, questionController.toggleSolved);
router.patch('/questions/:questionId/star', protect, questionController.toggleStarred);
router.put('/questions/:questionId/notes', protect, validate(updateNotesSchema), questionController.updateNotes);
router.delete('/topics/:topicId/subtopics/:subTopicId/questions/:questionId', protect, questionController.remove);
router.delete('/topics/:topicId/questions/:questionId', protect, questionController.remove);
router.delete('/questions/:questionId', protect, questionController.remove);
router.post('/questions/:questionId/attempts', protect, validate(addAttemptSchema), questionController.addAttempt);

export default router;
