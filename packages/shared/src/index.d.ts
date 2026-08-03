import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        name: string;
        email: string;
    }, {
        password: string;
        name: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        name: string;
        email: string;
    };
}, {
    body: {
        password: string;
        name: string;
        email: string;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
    }, {
        password: string;
        email: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
    };
}, {
    body: {
        password: string;
        email: string;
    };
}>;
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export declare const createTopicSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
    }, {
        title: string;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        description?: string | undefined;
    };
}, {
    body: {
        title: string;
        description?: string | undefined;
    };
}>;
export declare const updateTopicSchema: z.ZodObject<{
    params: z.ZodObject<{
        topicId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        topicId: string;
    }, {
        topicId: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["Pending", "In Progress", "Completed"]>>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        title?: string | undefined;
        status?: "Pending" | "In Progress" | "Completed" | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
        status?: "Pending" | "In Progress" | "Completed" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        topicId: string;
    };
    body: {
        description?: string | undefined;
        title?: string | undefined;
        status?: "Pending" | "In Progress" | "Completed" | undefined;
    };
}, {
    params: {
        topicId: string;
    };
    body: {
        description?: string | undefined;
        title?: string | undefined;
        status?: "Pending" | "In Progress" | "Completed" | undefined;
    };
}>;
export declare const reorderTopicsSchema: z.ZodObject<{
    body: z.ZodObject<{
        orderedIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        orderedIds: string[];
    }, {
        orderedIds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        orderedIds: string[];
    };
}, {
    body: {
        orderedIds: string[];
    };
}>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>['body'];
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>['body'];
export declare const createSubTopicSchema: z.ZodObject<{
    params: z.ZodObject<{
        topicId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        topicId: string;
    }, {
        topicId: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
    }, {
        title: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        topicId: string;
    };
    body: {
        title: string;
    };
}, {
    params: {
        topicId: string;
    };
    body: {
        title: string;
    };
}>;
export declare const updateSubTopicSchema: z.ZodObject<{
    params: z.ZodObject<{
        subTopicId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        subTopicId: string;
    }, {
        subTopicId: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
    }, {
        title?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        subTopicId: string;
    };
    body: {
        title?: string | undefined;
    };
}, {
    params: {
        subTopicId: string;
    };
    body: {
        title?: string | undefined;
    };
}>;
export declare const reorderSubTopicsSchema: z.ZodObject<{
    body: z.ZodObject<{
        orderedIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        orderedIds: string[];
    }, {
        orderedIds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        orderedIds: string[];
    };
}, {
    body: {
        orderedIds: string[];
    };
}>;
export type CreateSubTopicInput = z.infer<typeof createSubTopicSchema>['body'];
export type UpdateSubTopicInput = z.infer<typeof updateSubTopicSchema>['body'];
export declare const createQuestionSchema: z.ZodObject<{
    params: z.ZodObject<{
        topicId: z.ZodString;
        subTopicId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"null">]>>;
    }, "strip", z.ZodTypeAny, {
        topicId: string;
        subTopicId?: string | undefined;
    }, {
        topicId: string;
        subTopicId?: string | undefined;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        difficulty: z.ZodOptional<z.ZodEnum<["Basic", "Easy", "Medium", "Hard"]>>;
        problemUrl: z.ZodOptional<z.ZodString>;
        platform: z.ZodOptional<z.ZodEnum<["leetcode", "geeksforgeeks", "codestudio", "hackerrank", "codechef", "interviewbit", "ninjas", "other"]>>;
        resource: z.ZodOptional<z.ZodString>;
        companyTags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        difficulty?: "Basic" | "Easy" | "Medium" | "Hard" | undefined;
        problemUrl?: string | undefined;
        platform?: "leetcode" | "geeksforgeeks" | "codestudio" | "hackerrank" | "codechef" | "interviewbit" | "ninjas" | "other" | undefined;
        resource?: string | undefined;
        companyTags?: string[] | undefined;
    }, {
        title: string;
        difficulty?: "Basic" | "Easy" | "Medium" | "Hard" | undefined;
        problemUrl?: string | undefined;
        platform?: "leetcode" | "geeksforgeeks" | "codestudio" | "hackerrank" | "codechef" | "interviewbit" | "ninjas" | "other" | undefined;
        resource?: string | undefined;
        companyTags?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        topicId: string;
        subTopicId?: string | undefined;
    };
    body: {
        title: string;
        difficulty?: "Basic" | "Easy" | "Medium" | "Hard" | undefined;
        problemUrl?: string | undefined;
        platform?: "leetcode" | "geeksforgeeks" | "codestudio" | "hackerrank" | "codechef" | "interviewbit" | "ninjas" | "other" | undefined;
        resource?: string | undefined;
        companyTags?: string[] | undefined;
    };
}, {
    params: {
        topicId: string;
        subTopicId?: string | undefined;
    };
    body: {
        title: string;
        difficulty?: "Basic" | "Easy" | "Medium" | "Hard" | undefined;
        problemUrl?: string | undefined;
        platform?: "leetcode" | "geeksforgeeks" | "codestudio" | "hackerrank" | "codechef" | "interviewbit" | "ninjas" | "other" | undefined;
        resource?: string | undefined;
        companyTags?: string[] | undefined;
    };
}>;
export declare const updateNotesSchema: z.ZodObject<{
    params: z.ZodObject<{
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
    }, {
        questionId: string;
    }>;
    body: z.ZodObject<{
        notes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        notes: string;
    }, {
        notes: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        questionId: string;
    };
    body: {
        notes: string;
    };
}, {
    params: {
        questionId: string;
    };
    body: {
        notes: string;
    };
}>;
export declare const addAttemptSchema: z.ZodObject<{
    params: z.ZodObject<{
        questionId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
    }, {
        questionId: string;
    }>;
    body: z.ZodObject<{
        duration: z.ZodOptional<z.ZodNumber>;
        confidence: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        duration?: number | undefined;
        confidence?: number | undefined;
    }, {
        duration?: number | undefined;
        confidence?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        questionId: string;
    };
    body: {
        duration?: number | undefined;
        confidence?: number | undefined;
    };
}, {
    params: {
        questionId: string;
    };
    body: {
        duration?: number | undefined;
        confidence?: number | undefined;
    };
}>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>['body'];
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>['body'];
export type AddAttemptInput = z.infer<typeof addAttemptSchema>['body'];
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
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
        isProfilePublic: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        username?: string | undefined;
        bio?: string | undefined;
        avatarUrl?: string | undefined;
        isProfilePublic?: boolean | undefined;
    }, {
        username?: string | undefined;
        bio?: string | undefined;
        avatarUrl?: string | undefined;
        isProfilePublic?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        username?: string | undefined;
        bio?: string | undefined;
        avatarUrl?: string | undefined;
        isProfilePublic?: boolean | undefined;
    };
}, {
    body: {
        username?: string | undefined;
        bio?: string | undefined;
        avatarUrl?: string | undefined;
        isProfilePublic?: boolean | undefined;
    };
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export declare const publishSheetSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isPublic: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        isPublic?: boolean | undefined;
    }, {
        title: string;
        description?: string | undefined;
        isPublic?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        description?: string | undefined;
        isPublic?: boolean | undefined;
    };
}, {
    body: {
        title: string;
        description?: string | undefined;
        isPublic?: boolean | undefined;
    };
}>;
export type PublishSheetInput = z.infer<typeof publishSheetSchema>['body'];
export declare const createGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
    };
}, {
    body: {
        name: string;
    };
}>;
export declare const joinGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        inviteCode: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        inviteCode: string;
    }, {
        inviteCode: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        inviteCode: string;
    };
}, {
    body: {
        inviteCode: string;
    };
}>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>['body'];
export type JoinGroupInput = z.infer<typeof joinGroupSchema>['body'];
