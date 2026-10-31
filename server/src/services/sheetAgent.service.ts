import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { cache } from '../utils/cache.js';
import { AppError } from '../utils/AppError.js';
import { sheetRepository } from '../repositories/sheet.repository.js';
import { topicRepository } from '../repositories/topic.repository.js';
import {
  SheetAgentPlanInput,
  SheetActionDiff,
  SheetAgentApplyInput,
  GeneratedTopic,
} from '@algoforge/shared';
import { logger } from '../utils/logger.js';

export const planSheetAction = async (
  userId: string,
  input: SheetAgentPlanInput
): Promise<SheetActionDiff> => {
  const { prompt, targetCount = 20, topicFocus, difficulty } = input;

  // Retrieve current user topics summary
  const currentTopics = await prisma.topic.findMany({
    where: { userId, deletedAt: null },
    include: {
      subTopics: {
        where: { deletedAt: null },
        include: {
          questions: {
            where: { deletedAt: null },
            select: { id: true, title: true, difficulty: true, isSolved: true },
          },
        },
      },
      questions: {
        where: { deletedAt: null, subTopicId: null },
        select: { id: true, title: true, difficulty: true, isSolved: true },
      },
    },
  });

  const topicSummaries = currentTopics.map((t) => {
    const allQs = [
      ...t.questions,
      ...t.subTopics.flatMap((st) => st.questions),
    ];
    return {
      id: t.id,
      title: t.title,
      totalQuestions: allQs.length,
      solvedCount: allQs.filter((q) => q.isSolved).length,
      questions: allQs.map((q) => ({ id: q.id, title: q.title, difficulty: q.difficulty, isSolved: q.isSolved })),
    };
  });

  // If Gemini API is available, generate agentic diff
  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    try {
      return await generateLLMActionPlan({
        prompt,
        targetCount,
        topicFocus,
        difficulty,
        currentTopics: topicSummaries,
      });
    } catch (err) {
      logger.warn({ err }, 'Gemini Agent call failed, falling back to heuristic curriculum engine');
    }
  }

  // Fallback: Heuristic curriculum engine
  return generateHeuristicActionPlan({
    prompt,
    targetCount,
    topicFocus,
    difficulty,
    currentTopics: topicSummaries,
  });
};

const generateLLMActionPlan = async (context: {
  prompt: string;
  targetCount: number;
  topicFocus?: string;
  difficulty?: string;
  currentTopics: Array<{
    id: string;
    title: string;
    totalQuestions: number;
    solvedCount: number;
    questions: Array<{ id: string; title: string; difficulty: string; isSolved: boolean }>;
  }>;
}): Promise<SheetActionDiff> => {
  const systemPrompt = `You are the AlgoForge AI Sheet Copilot. You are an expert DSA curriculum engineer and FAANG interview prep mentor.
Analyze the user's natural language command and their current sheet topics.
Generate a structured Action Diff conforming strictly to this JSON format:
{
  "summary": string (concise explanation of actions planned, max 2 sentences),
  "addedTopics": array of {
    "title": string (topic title, e.g. "Dynamic Programming", "Trees & Graphs"),
    "description": optional string,
    "subtopics": array of {
      "title": string (e.g. "0/1 Knapsack", "Lowest Common Ancestor"),
      "questions": array of {
        "title": string (Real canonical LeetCode problem title, e.g. "Trapping Rain Water", "Course Schedule II"),
        "difficulty": "Basic" | "Easy" | "Medium" | "Hard",
        "problemUrl": string (Valid leetcode.com/problems/... URL),
        "platform": "leetcode" | "geeksforgeeks" | "codechef",
        "companyTags": array of strings (e.g. ["Google", "Amazon", "Meta"])
      }
    }
  },
  "removedQuestionIds": array of strings (IDs of existing questions from the provided context that should be pruned/removed based on user instructions, or empty array),
  "reorderedTopicIds": array of strings (ordered topic IDs if the user asked to reorder topics, or empty array)
}

RULES:
1. Always generate authentic canonical DSA problems with real URLs.
2. If the user asks for a company or job description (e.g. "Amazon SDE-1" or JD text), curate high-frequency problems for that target.
3. If the user asks to prune or remove solved questions or easy questions, populate "removedQuestionIds" with matching IDs from the current sheet context.
4. Total questions across addedTopics should be approximately ${context.targetCount} problems unless the user explicitly requested otherwise.
Return ONLY valid JSON.`;

  const userPayload = {
    instruction: context.prompt,
    desiredCount: context.targetCount,
    topicFocus: context.topicFocus || 'All Topics',
    difficultyPreference: context.difficulty || 'Any',
    existingTopicsSummary: context.currentTopics.map((t) => ({
      id: t.id,
      title: t.title,
      questionCount: t.totalQuestions,
      solvedCount: t.solvedCount,
      questions: t.questions,
    })),
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Request & Context:\n${JSON.stringify(userPayload, null, 2)}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    }
  );

  const json: any = await res.json();
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Empty response from Gemini Sheet Agent');
  }

  const parsed = JSON.parse(rawText) as SheetActionDiff;
  return {
    summary: parsed.summary || 'Curriculum generated according to requirements.',
    addedTopics: parsed.addedTopics || [],
    removedQuestionIds: parsed.removedQuestionIds || [],
    reorderedTopicIds: parsed.reorderedTopicIds || [],
  };
};

const generateHeuristicActionPlan = (context: {
  prompt: string;
  targetCount: number;
  topicFocus?: string;
  difficulty?: string;
  currentTopics: Array<{
    id: string;
    title: string;
    totalQuestions: number;
    solvedCount: number;
    questions: Array<{ id: string; title: string; difficulty: string; isSolved: boolean }>;
  }>;
}): SheetActionDiff => {
  const lowerPrompt = context.prompt.toLowerCase();

  // Check if user requested pruning solved
  const removedQuestionIds: string[] = [];
  if (lowerPrompt.includes('prune') || lowerPrompt.includes('remove solved') || lowerPrompt.includes('clean')) {
    for (const t of context.currentTopics) {
      for (const q of t.questions) {
        if (q.isSolved) {
          removedQuestionIds.push(q.id);
        }
      }
    }
  }

  // Canonical problems bank
  const canonicalTopics: GeneratedTopic[] = [
    {
      title: 'Arrays & Two Pointers',
      description: 'Foundational array patterns, two pointers, and sliding window techniques.',
      subtopics: [
        {
          title: 'Two Pointers & Sliding Window',
          questions: [
            {
              title: 'Two Sum',
              difficulty: 'Easy',
              problemUrl: 'https://leetcode.com/problems/two-sum/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Google', 'Meta'],
            },
            {
              title: '3Sum',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/3sum/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Meta'],
            },
            {
              title: 'Container With Most Water',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/container-with-most-water/',
              platform: 'leetcode',
              companyTags: ['Google', 'Amazon'],
            },
            {
              title: 'Trapping Rain Water',
              difficulty: 'Hard',
              problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Google', 'Goldman Sachs'],
            },
          ],
        },
      ],
    },
    {
      title: 'Trees & Graphs',
      description: 'Hierarchical traversals, shortest paths, and topological ordering.',
      subtopics: [
        {
          title: 'Binary Tree Traversals & Properties',
          questions: [
            {
              title: 'Maximum Depth of Binary Tree',
              difficulty: 'Easy',
              problemUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Microsoft'],
            },
            {
              title: 'Lowest Common Ancestor of a Binary Tree',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
              platform: 'leetcode',
              companyTags: ['Meta', 'Amazon'],
            },
            {
              title: 'Binary Tree Maximum Path Sum',
              difficulty: 'Hard',
              problemUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
              platform: 'leetcode',
              companyTags: ['Google', 'Meta', 'Amazon'],
            },
            {
              title: 'Course Schedule II',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/course-schedule-ii/',
              platform: 'leetcode',
              companyTags: ['Google', 'Uber', 'Amazon'],
            },
          ],
        },
      ],
    },
    {
      title: 'Dynamic Programming',
      description: 'Optimal substructure, memoization, and bottom-up DP grids.',
      subtopics: [
        {
          title: 'Subsequences & Knapsack Patterns',
          questions: [
            {
              title: 'Climbing Stairs',
              difficulty: 'Easy',
              problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Google'],
            },
            {
              title: 'Coin Change',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/coin-change/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Microsoft', 'Bloomberg'],
            },
            {
              title: 'Longest Increasing Subsequence',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
              platform: 'leetcode',
              companyTags: ['Google', 'Meta'],
            },
            {
              title: 'Word Break',
              difficulty: 'Medium',
              problemUrl: 'https://leetcode.com/problems/word-break/',
              platform: 'leetcode',
              companyTags: ['Amazon', 'Meta'],
            },
          ],
        },
      ],
    },
  ];

  return {
    summary: `Curated ${canonicalTopics.length} core DSA topics (${canonicalTopics.flatMap((t) => t.subtopics.flatMap((st) => st.questions)).length} problems) tailored to ${context.prompt}.${removedQuestionIds.length > 0 ? ` Marked ${removedQuestionIds.length} solved problems for pruning.` : ''}`,
    addedTopics: canonicalTopics,
    removedQuestionIds,
    reorderedTopicIds: [],
  };
};

export const applySheetAction = async (
  userId: string,
  input: SheetAgentApplyInput
) => {
  const { diff, destination, sheetTitle, sheetDescription, isPublic } = input;

  // Case 1: Save as New Public/Community Sheet
  if (destination === 'sheet') {
    const title = sheetTitle || `Curated Sheet (${new Date().toLocaleDateString()})`;
    const description = sheetDescription || diff.summary || 'AI-curated DSA curriculum';

    const normalizedTopics = (diff.addedTopics || []).map((t) => {
      const subList = t.subtopics || (t as any).subTopics || [];
      return {
        title: t.title,
        description: t.description || '',
        subtopics: subList,
        subTopics: subList,
      };
    });

    const sheet = await sheetRepository.create({
      title,
      description,
      isPublic: isPublic ?? true,
      author: { connect: { id: userId } },
      topics: normalizedTopics as any,
    });

    return {
      success: true,
      message: `Created community sheet "${sheet.title}"`,
      sheetId: sheet.id,
    };
  }

  // Case 2 & 3: Workspace Commit (Append or Replace)
  await prisma.$transaction(async (tx) => {
    // If Replace, complete soft-deletion on topics, subtopics, and questions
    if (destination === 'replace') {
      await tx.topic.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      await tx.subTopic.updateMany({
        where: { topic: { userId }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      await tx.question.updateMany({
        where: {
          OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }],
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });
    }

    // Remove explicitly requested questions
    if (diff.removedQuestionIds && diff.removedQuestionIds.length > 0) {
      await tx.question.updateMany({
        where: {
          id: { in: diff.removedQuestionIds },
          OR: [{ topic: { userId } }, { subTopic: { topic: { userId } } }],
        },
        data: { deletedAt: new Date() },
      });
    }

    // Determine starting order for new topics
    const currentCount = await tx.topic.count({ where: { userId, deletedAt: null } });
    let globalOrder = destination === 'replace' ? 0 : currentCount;

    for (const topicData of diff.addedTopics) {
      const topic = await tx.topic.create({
        data: {
          title: topicData.title,
          description: topicData.description || '',
          order: globalOrder++,
          status: 'Pending',
          userId,
        },
        select: { id: true },
      });

      const subtopicsList = topicData.subtopics || (topicData as any).subTopics || [];
      if (subtopicsList && subtopicsList.length > 0) {
        for (let sIdx = 0; sIdx < subtopicsList.length; sIdx++) {
          const sub = subtopicsList[sIdx];
          const subTopic = await tx.subTopic.create({
            data: {
              title: sub.title,
              order: sIdx,
              topicId: topic.id,
            },
            select: { id: true },
          });

          if (sub.questions && sub.questions.length > 0) {
            await tx.question.createMany({
              data: sub.questions.map((q: any, qIdx: number) => ({
                title: q.title,
                difficulty: q.difficulty || 'Medium',
                order: qIdx,
                problemUrl: q.problemUrl || '#',
                platform: q.platform || 'leetcode',
                resource: '#',
                companyTags: q.companyTags || [],
                topicId: topic.id,
                subTopicId: subTopic.id,
              })),
            });
          }
        }
      }
    }
  });

  if (diff.reorderedTopicIds && diff.reorderedTopicIds.length > 0) {
    await topicRepository.reorder(userId, diff.reorderedTopicIds);
  }

  await cache.invalidateTag(`user:${userId}:topics`);
  await cache.invalidateTag(`user:${userId}:analytics`);
  await cache.invalidateTag(`user:${userId}:review`);

  return {
    success: true,
    message: destination === 'replace' ? 'Active workspace replaced with new curriculum' : 'Applied changes to active workspace',
  };
};
