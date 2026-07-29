import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID');

export const createTopicSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
  }),
});

export const updateTopicSchema = z.object({
  params: z.object({ topicId: uuid }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  }),
});

export const reorderTopicsSchema = z.object({
  body: z.object({
    orderedIds: z.array(uuid).min(1),
  }),
});
