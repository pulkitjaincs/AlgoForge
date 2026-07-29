import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID');

export const createSubTopicSchema = z.object({
  params: z.object({
    topicId: uuid,
  }),
  body: z.object({
    title: z.string().min(1).max(200),
  }),
});

export const updateSubTopicSchema = z.object({
  params: z.object({ subTopicId: uuid }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
  }),
});

export const reorderSubTopicsSchema = z.object({
  body: z.object({
    orderedIds: z.array(uuid).min(1),
  }),
});
