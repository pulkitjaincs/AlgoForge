import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../middleware/auth.js', () => ({
  protect: (req: any, _res: any, next: any) => {
    req.user = { id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' };
    next();
  },
}));

vi.mock('../controllers/question.controller.js', () => ({
  reorder: vi.fn((req, res) => res.status(200).json({ success: true, data: { message: 'Questions reordered' } })),
  create: vi.fn((req, res) => res.status(201).json({ success: true, data: { id: 'created-q' } })),
  getById: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  update: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  updateNotes: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  toggleSolved: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  toggleStarred: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  remove: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  addAttempt: vi.fn((req, res) => res.status(201).json({ success: true, data: {} })),
}));

vi.mock('../controllers/subtopic.controller.js', () => ({
  create: vi.fn((req, res) => res.status(201).json({ success: true, data: {} })),
  update: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  remove: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
  reorder: vi.fn((req, res) => res.status(200).json({ success: true, data: {} })),
}));

import apiRoutes from '../routes/index.js';
import * as questionController from '../controllers/question.controller.js';
import * as subtopicController from '../controllers/subtopic.controller.js';
import { errorHandler } from '../middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(errorHandler);

const TOPIC_ID = '11111111-1111-1111-1111-111111111111';
const SUBTOPIC_ID = '22222222-2222-2222-2222-222222222222';
const VALID_UUID_1 = '33333333-3333-3333-3333-333333333333';
const VALID_UUID_2 = '44444444-4444-4444-4444-444444444444';

describe('API Route Alignment and HTTP Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Question Reordering Routes', () => {
    it('accepts PUT /api/v1/topics/:topicId/subtopics/:subTopicId/questions/reorder', async () => {
      const res = await request(app)
        .put(`/api/v1/topics/${TOPIC_ID}/subtopics/${SUBTOPIC_ID}/questions/reorder`)
        .send({ orderedIds: [VALID_UUID_1, VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.reorder).toHaveBeenCalledTimes(1);
    });

    it('accepts PUT /api/v1/topics/:topicId/questions/reorder', async () => {
      const res = await request(app)
        .put(`/api/v1/topics/${TOPIC_ID}/questions/reorder`)
        .send({ orderedIds: [VALID_UUID_1, VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.reorder).toHaveBeenCalledTimes(1);
    });

    it('accepts direct PUT /api/v1/questions/reorder', async () => {
      const res = await request(app)
        .put('/api/v1/questions/reorder')
        .send({ orderedIds: [VALID_UUID_1, VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.reorder).toHaveBeenCalledTimes(1);
    });

    it('blocks question reorder with empty orderedIds before controller execution', async () => {
      const res = await request(app)
        .put('/api/v1/questions/reorder')
        .send({ orderedIds: [] });

      expect(res.body.success).toBe(false);
      expect(questionController.reorder).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it('blocks question reorder with non-uuid strings before controller execution', async () => {
      const res = await request(app)
        .put('/api/v1/questions/reorder')
        .send({ orderedIds: ['not-a-uuid'] });

      expect(res.body.success).toBe(false);
      expect(questionController.reorder).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe('Subtopic Reordering and Deletion Routes', () => {
    it('accepts PUT /api/v1/topics/:topicId/subtopics/reorder', async () => {
      const res = await request(app)
        .put(`/api/v1/topics/${TOPIC_ID}/subtopics/reorder`)
        .send({ orderedIds: [VALID_UUID_1, VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(subtopicController.reorder).toHaveBeenCalledTimes(1);
    });

    it('accepts POST /api/v1/topics/:topicId/subtopics/reorder (backward compatibility)', async () => {
      const res = await request(app)
        .post(`/api/v1/topics/${TOPIC_ID}/subtopics/reorder`)
        .send({ orderedIds: [VALID_UUID_1, VALID_UUID_2] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(subtopicController.reorder).toHaveBeenCalledTimes(1);
    });

    it('accepts DELETE /api/v1/topics/:topicId/subtopics/:subTopicId (nested delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/topics/${TOPIC_ID}/subtopics/${SUBTOPIC_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(subtopicController.remove).toHaveBeenCalledTimes(1);
    });

    it('accepts DELETE /api/v1/subtopics/:subTopicId (direct delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/subtopics/${SUBTOPIC_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(subtopicController.remove).toHaveBeenCalledTimes(1);
    });

    it('blocks subtopic reorder with empty orderedIds before controller execution', async () => {
      const res = await request(app)
        .put(`/api/v1/topics/${TOPIC_ID}/subtopics/reorder`)
        .send({ orderedIds: [] });

      expect(res.body.success).toBe(false);
      expect(subtopicController.reorder).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe('Question Creation Routes', () => {
    it('accepts question creation with empty strings for optional URLs', async () => {
      const res = await request(app)
        .post(`/api/v1/topics/${TOPIC_ID}/questions`)
        .send({
          title: 'Two Sum',
          problemUrl: '',
          resource: '',
          difficulty: 'Medium',
          platform: 'leetcode',
          companyTags: [],
          notes: '',
          isStarred: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(questionController.create).toHaveBeenCalledTimes(1);
    });

    it('accepts question creation with valid URLs, notes, and isStarred', async () => {
      const res = await request(app)
        .post(`/api/v1/topics/${TOPIC_ID}/subtopics/${SUBTOPIC_ID}/questions`)
        .send({
          title: '3Sum',
          problemUrl: 'https://leetcode.com/problems/3sum/',
          resource: 'https://youtube.com/watch?v=123',
          difficulty: 'Medium',
          platform: 'leetcode',
          companyTags: ['Amazon'],
          notes: 'Two pointers approach',
          isStarred: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(questionController.create).toHaveBeenCalledTimes(1);
    });

    it('returns 400 Bad Request (not 500) when title is missing', async () => {
      const res = await request(app)
        .post(`/api/v1/topics/${TOPIC_ID}/questions`)
        .send({
          title: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(questionController.create).not.toHaveBeenCalled();
    });
  });

  describe('Question Deletion Routes', () => {
    it('accepts DELETE /api/v1/questions/:questionId (direct delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/questions/${VALID_UUID_1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.remove).toHaveBeenCalledTimes(1);
    });

    it('accepts DELETE /api/v1/topics/:topicId/questions/:questionId (topic-nested delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/topics/${TOPIC_ID}/questions/${VALID_UUID_1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.remove).toHaveBeenCalledTimes(1);
    });

    it('accepts DELETE /api/v1/topics/:topicId/subtopics/:subTopicId/questions/:questionId (subtopic-nested delete)', async () => {
      const res = await request(app)
        .delete(`/api/v1/topics/${TOPIC_ID}/subtopics/${SUBTOPIC_ID}/questions/${VALID_UUID_1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(questionController.remove).toHaveBeenCalledTimes(1);
    });
  });
});
