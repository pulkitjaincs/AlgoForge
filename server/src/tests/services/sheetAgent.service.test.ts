import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sheetAgentService from '../../services/sheetAgent.service.js';
import { prisma } from '../../config/database.js';
import { cache } from '../../utils/cache.js';
import { topicRepository } from '../../repositories/topic.repository.js';
import { sheetRepository } from '../../repositories/sheet.repository.js';
import { questionRepository } from '../../repositories/question.repository.js';

vi.mock('../../repositories/topic.repository.js', () => ({
  topicRepository: {
    findManyByUserIdWithRelations: vi.fn(),
    reorder: vi.fn(),
  },
}));

vi.mock('../../repositories/sheet.repository.js', () => ({
  sheetRepository: {
    create: vi.fn(),
  },
}));

vi.mock('../../repositories/question.repository.js', () => ({
  questionRepository: {
    findSolvedQuestions: vi.fn(),
  },
}));

describe('Sheet Agent Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(prisma);
    });
  });

  describe('planSheetAction', () => {
    it('should generate heuristic plan when no API key configured', async () => {
      (prisma.topic.findMany as any).mockResolvedValue([]);

      const plan = await sheetAgentService.planSheetAction('u1', {
        prompt: 'Build a Dynamic Programming mastery sheet',
      });

      expect(plan).toBeDefined();
      expect(plan.summary).toContain('Curated');
      expect(plan.addedTopics.length).toBeGreaterThan(0);
      expect(plan.addedTopics[0].subtopics).toBeDefined();
      expect(Array.isArray(plan.addedTopics[0].subtopics)).toBe(true);
    });
  });

  describe('applySheetAction - Workspace Destination', () => {
    it('should remove explicitly requested questions matching either topic or subtopic relation', async () => {
      (prisma.topic.count as any).mockResolvedValue(2);
      (prisma.topic.create as any).mockResolvedValue({ id: 'top-1' });
      (prisma.subTopic.create as any).mockResolvedValue({ id: 'sub-1' });
      (prisma.question.createMany as any).mockResolvedValue({ count: 1 });

      const diff = {
        summary: 'Pruning old solved questions',
        addedTopics: [],
        removedQuestionIds: ['q-direct-1', 'q-subtopic-2'],
      };

      await sheetAgentService.applySheetAction('u1', {
        destination: 'workspace',
        diff,
      });

      expect(prisma.question.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['q-direct-1', 'q-subtopic-2'] },
          OR: [{ topic: { userId: 'u1' } }, { subTopic: { topic: { userId: 'u1' } } }],
        },
        data: { deletedAt: expect.any(Date) },
      });

      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:topics');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:analytics');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:review');
    });

    it('should execute reorderedTopicIds when present', async () => {
      (prisma.topic.count as any).mockResolvedValue(0);

      const diff = {
        summary: 'Reordering',
        addedTopics: [],
        removedQuestionIds: [],
        reorderedTopicIds: ['top-3', 'top-1', 'top-2'],
      };

      await sheetAgentService.applySheetAction('u1', {
        destination: 'workspace',
        diff,
      });

      expect(topicRepository.reorder).toHaveBeenCalledWith('u1', ['top-3', 'top-1', 'top-2']);
    });
  });

  describe('applySheetAction - Replace Destination', () => {
    it('should soft-delete topics, subtopics, and questions cascadingly and invalidate review cache', async () => {
      (prisma.topic.count as any).mockResolvedValue(0);

      const diff = {
        summary: 'Replacing complete curriculum',
        addedTopics: [],
        removedQuestionIds: [],
      };

      await sheetAgentService.applySheetAction('u1', {
        destination: 'replace',
        diff,
      });

      expect(prisma.topic.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });

      expect(prisma.subTopic.updateMany).toHaveBeenCalledWith({
        where: { topic: { userId: 'u1' }, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });

      expect(prisma.question.updateMany).toHaveBeenCalledWith({
        where: {
          OR: [{ topic: { userId: 'u1' } }, { subTopic: { topic: { userId: 'u1' } } }],
          deletedAt: null,
        },
        data: { deletedAt: expect.any(Date) },
      });

      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:review');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:topics');
      expect(cache.invalidateTag).toHaveBeenCalledWith('user:u1:analytics');
    });
  });

  describe('applySheetAction - Community Sheet Destination', () => {
    it('should create sheet with dual subtopics and subTopics casing compatibility', async () => {
      (sheetRepository.create as any).mockResolvedValue({ id: 'sheet-123', title: 'Curated Sheet' });

      const diff = {
        summary: 'Curated Sheet',
        addedTopics: [
          {
            title: 'Graphs',
            description: 'Graph algorithms',
            subtopics: [
              {
                title: 'BFS',
                questions: [{ title: 'Rotting Oranges', difficulty: 'Medium' as const }],
              },
            ],
          },
        ],
      };

      const result = await sheetAgentService.applySheetAction('u1', {
        destination: 'sheet',
        sheetTitle: 'Curated Sheet',
        isPublic: true,
        diff,
      });

      expect(result.sheetId).toBe('sheet-123');
      const createArgs = (sheetRepository.create as any).mock.calls[0][0];
      expect(createArgs.title).toBe('Curated Sheet');
      expect(createArgs.topics[0].subtopics).toBeDefined();
      expect(createArgs.topics[0].subTopics).toBeDefined();
      expect(createArgs.topics[0].subtopics).toEqual(createArgs.topics[0].subTopics);
    });
  });
});
