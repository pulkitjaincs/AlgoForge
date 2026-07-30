import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID');

export const createQuestionSchema = z.object({
  params: z.object({
    topicId: uuid,
    subTopicId: uuid.or(z.literal('null')).optional(),
  }),
  body: z.object({
    title: z.string().min(1).max(500),
    difficulty: z.enum(['Basic', 'Easy', 'Medium', 'Hard']).optional(),
    problemUrl: z.string().url().optional(),
    platform: z.enum(['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other']).optional(),
    resource: z.string().url().optional(),
    companyTags: z.array(z.string().max(50)).max(20).optional(),
  }),
});

export const updateNotesSchema = z.object({
  params: z.object({ questionId: uuid }),
  body: z.object({
    notes: z.string().max(5000),
  }),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>['body'];
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>['body'];
