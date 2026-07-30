import { Router } from 'express';
import * as questionController from '../controllers/question.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createQuestionSchema, updateNotesSchema, addAttemptSchema } from '../schemas/question.schema.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.post('/topics/:topicId/subtopics/:subTopicId/questions', validate(createQuestionSchema), questionController.create);
router.patch('/questions/:questionId/solved', questionController.toggleSolved);
router.put('/questions/:questionId/notes', validate(updateNotesSchema), questionController.updateNotes);
router.delete('/questions/:questionId', questionController.remove);
router.post('/questions/:questionId/attempts', validate(addAttemptSchema), questionController.addAttempt);

export default router;
