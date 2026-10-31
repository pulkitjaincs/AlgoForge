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
    problemUrl: z.union([z.string().url(), z.literal(''), z.literal('#')]).nullable().optional(),
    platform: z.enum(['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other']).optional(),
    resource: z.union([z.string().url(), z.literal(''), z.literal('#')]).nullable().optional(),
    companyTags: z.array(z.string().max(50)).max(20).optional(),
    notes: z.string().max(5000).optional(),
    isStarred: z.boolean().optional(),
  }),
});

export const updateNotesSchema = z.object({
  params: z.object({ questionId: uuid }),
  body: z.object({
    notes: z.string().max(5000),
  }),
});

export const updateQuestionSchema = z.object({
  params: z.object({ questionId: uuid }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    difficulty: z.enum(['Basic', 'Easy', 'Medium', 'Hard']).optional(),
    problemUrl: z.union([z.string().url(), z.literal(''), z.literal('#')]).nullable().optional(),
    platform: z.enum(['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other']).optional(),
    resource: z.union([z.string().url(), z.literal(''), z.literal('#')]).nullable().optional(),
    companyTags: z.array(z.string().max(50)).max(20).optional(),
    notes: z.string().max(5000).optional(),
    isStarred: z.boolean().optional(),
  }),
});

export const addAttemptSchema = z.object({
  params: z.object({ questionId: uuid }),
  body: z.object({
    confidence: z.number().int().min(1).max(5).optional()
  }),
});

export const reorderQuestionsSchema = z.object({
  body: z.object({
    orderedIds: z.array(uuid).min(1),
  }),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>['body'];
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>['body'];
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>['body'];
export type AddAttemptInput = z.infer<typeof addAttemptSchema>['body'];
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>['body'];

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
    avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
    isProfilePublic: z.boolean().optional(),
    defaultHeatmapRange: z.string().optional(),
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

// Integration Schemas
export const linkIntegrationSchema = z.object({
  body: z.object({
    platform: z.enum(['leetcode', 'codeforces', 'codechef', 'gfg', 'atcoder', 'github']),
    username: z.string().min(1),
    accessToken: z.string().optional(),
  }),
});

export type LinkIntegrationInput = z.infer<typeof linkIntegrationSchema>['body'];

// Trash Schemas
export const trashActionSchema = z.object({
  body: z.object({
    type: z.enum(['topic', 'subtopic', 'question']),
  }),
});

export type TrashActionInput = z.infer<typeof trashActionSchema>['body'];

// Settings Schemas
export const updateEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export type UpdateEmailInput = z.infer<typeof updateEmailSchema>['body'];
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>['body'];

// AI Schemas
export const socraticHintSchema = z.object({
  body: z.object({
    questionId: uuid,
    userCode: z.string().max(20000).optional(),
    currentApproach: z.string().max(2000).optional(),
    hintLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
});

export type SocraticHintInput = z.infer<typeof socraticHintSchema>['body'];

export interface SocraticHintResponse {
  hintLevel: 1 | 2 | 3;
  levelName: 'conceptual' | 'complexity_edge_case' | 'counter_example';
  guidance: string;
  complexityTarget?: string;
  counterExample?: string;
  thoughtPrompt: string;
}

export interface AICoachPlan {
  headline: string;
  analysis: string;
  targetMinutes: number;
  contestAlert?: {
    platform: string;
    title: string;
    startTime: string;
    hoursUntil: number;
  };
  recommendations: Array<{
    type: 'review' | 'weak_area' | 'contest_prep' | 'speed_drill';
    title: string;
    reason: string;
    difficulty?: string;
  }>;
  motivationalTip: string;
}

// Sheet Agent & Generation Schemas
export const generatedQuestionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(500),
  difficulty: z.enum(['Basic', 'Easy', 'Medium', 'Hard']).default('Medium'),
  problemUrl: z.string().url().or(z.literal('')).or(z.literal('#')).default(''),
  platform: z.enum(['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other']).default('leetcode'),
  companyTags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const generatedSubTopicSchema = z.object({
  title: z.string().min(1).max(200),
  questions: z.array(generatedQuestionSchema).default([]),
});

export const generatedTopicSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  subtopics: z.array(generatedSubTopicSchema).default([]),
});

export const sheetActionDiffSchema = z.object({
  summary: z.string(),
  addedTopics: z.array(generatedTopicSchema).default([]),
  removedQuestionIds: z.array(z.string()).default([]),
  reorderedTopicIds: z.array(z.string()).default([]),
});

export const sheetAgentPlanSchema = z.object({
  body: z.object({
    prompt: z.string().min(2, 'Prompt must be at least 2 characters').max(5000),
    targetCount: z.number().int().min(5).max(100).optional().default(25),
    topicFocus: z.string().optional(),
    difficulty: z.string().optional(),
  }),
});

export const sheetAgentApplySchema = z.object({
  body: z.object({
    diff: sheetActionDiffSchema,
    destination: z.enum(['workspace', 'sheet', 'replace']).default('workspace'),
    sheetTitle: z.string().max(200).optional(),
    sheetDescription: z.string().max(1000).optional(),
    isPublic: z.boolean().optional().default(false),
  }),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedSubTopic = z.infer<typeof generatedSubTopicSchema>;
export type GeneratedTopic = z.infer<typeof generatedTopicSchema>;
export type SheetActionDiff = z.infer<typeof sheetActionDiffSchema>;
export type SheetAgentPlanInput = z.input<typeof sheetAgentPlanSchema>['body'];
export type SheetAgentApplyInput = z.input<typeof sheetAgentApplySchema>['body'];

