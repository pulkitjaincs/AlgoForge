import { z } from 'zod';
const uuid = z.string().uuid('Invalid UUID');
// Auth Schemas
export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(128),
    }),
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});
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
// Profile Schemas
export const updateProfileSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
        isProfilePublic: z.boolean().optional(),
    }),
});
// Sheet Schemas
export const publishSheetSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        isPublic: z.boolean().optional(),
    }),
});
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
