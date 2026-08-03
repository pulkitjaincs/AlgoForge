import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID');

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

// Topic Schemas
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

export type CreateTopicInput = z.infer<typeof createTopicSchema>['body'];
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>['body'];

// SubTopic Schemas
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

export type CreateSubTopicInput = z.infer<typeof createSubTopicSchema>['body'];
export type UpdateSubTopicInput = z.infer<typeof updateSubTopicSchema>['body'];

// Question Schemas
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

export const addAttemptSchema = z.object({
  params: z.object({ questionId: uuid }),
  body: z.object({
    duration: z.number().int().nonnegative().optional(),
    confidence: z.number().int().min(1).max(5).optional()
  }),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>['body'];
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>['body'];
export type AddAttemptInput = z.infer<typeof addAttemptSchema>['body'];

// Shared Types
export interface Question {
  id: string;
  title: string;
  isSolved: boolean;
  difficulty?: string;
  order?: number;
  problemUrl?: string;
  platform?: string;
  resource?: string;
  companyTags?: string[];
  isStarred?: boolean;
  notes?: string;
  topicId?: string | null;
  subTopicId?: string | null;
}

export interface SubTopic {
  id: string;
  title: string;
  order?: number;
  topicId?: string;
  questions?: Question[];
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  order?: number;
  status?: string;
  subTopics?: SubTopic[];
  questions?: Question[];
}

// Profile Schemas
export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    isProfilePublic: z.boolean().optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];

// Sheet Schemas
export const publishSheetSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    isPublic: z.boolean().optional(),
  }),
});

export type PublishSheetInput = z.infer<typeof publishSheetSchema>['body'];

// Group Schemas
export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(6),
  }),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>['body'];
export type JoinGroupInput = z.infer<typeof joinGroupSchema>['body'];
