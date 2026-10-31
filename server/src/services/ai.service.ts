import { env } from '../config/env.js';
import { cache } from '../utils/cache.js';
import { AppError } from '../utils/AppError.js';
import { getWeakAreas, getTopicMastery } from './analytics.service.js';
import { getReviewStats } from './review.service.js';
import { getUpcomingContests } from './contest.service.js';
import { getDailyPlan } from './practice.service.js';
import { getQuestionById } from './question.service.js';
import { AICoachPlan, SocraticHintResponse } from '@algoforge/shared';

// Guardrail regex to detect leaked full code solutions
const CODE_LEAK_REGEX = /(class\s+Solution|def\s+[a-zA-Z0-9_]+\s*\(|function\s+[a-zA-Z0-9_]+\s*\(|public\s+(?:class|void|int|boolean)|int\s+main\s*\()/i;

export const getUserStudyContext = async (userId: string) => {
  const [weakAreas, mastery, reviewStats, contests, dailyPlan] = await Promise.all([
    getWeakAreas(userId),
    getTopicMastery(userId),
    getReviewStats(userId),
    getUpcomingContests().catch(() => []),
    getDailyPlan(userId),
  ]);

  const now = new Date();
  const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const urgentContest = contests.find((c) => {
    const start = new Date(c.startTime);
    return start >= now && start <= next48Hours;
  });

  return {
    weakAreas,
    mastery,
    reviewStats,
    urgentContest,
    dailyPlan,
  };
};

export const getAICoachPlan = async (userId: string, forceRefresh = false): Promise<AICoachPlan> => {
  const cacheKey = `ai_coach_plan:${userId}`;
  const cooldownKey = `ai_coach_cooldown:${userId}`;

  if (forceRefresh) {
    const inCooldown = await cache.get<boolean>(cooldownKey);
    if (inCooldown) {
      throw new AppError('AI Coach plan can only be manually refreshed once per hour.', 429);
    }
  } else {
    const cached = await cache.get<AICoachPlan>(cacheKey);
    if (cached) return cached;
  }

  const context = await getUserStudyContext(userId);

  let plan: AICoachPlan;
  // If Gemini API Key and Model are configured in environment, use LLM
  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    try {
      plan = await generateLLMCoachPlan(context);
    } catch {
      plan = generateHeuristicCoachPlan(context);
    }
  } else {
    // Deterministic rule-based coach engine (ensures 100% offline stability)
    plan = generateHeuristicCoachPlan(context);
  }

  // Cache daily plan for 24 hours (86,400 seconds)
  await cache.setWithTag(cacheKey, `user:${userId}:analytics`, plan, 86400);

  if (forceRefresh) {
    // Enforce 1-hour cooldown (3,600 seconds)
    await cache.set(cooldownKey, true, 3600);
  }

  return plan;
};

const generateLLMCoachPlan = async (context: Awaited<ReturnType<typeof getUserStudyContext>>): Promise<AICoachPlan> => {
  const systemPrompt = `You are the AlgoForge AI Study Coach. Your job is to analyze real DSA telemetry for a software engineer and build a hyper-targeted daily prep plan.
Return ONLY valid JSON matching this exact schema:
{
  "headline": string (punchy 1-sentence focus),
  "analysis": string (2-3 sentences assessing weak topics and upcoming contests),
  "targetMinutes": number (between 45 and 120),
  "contestAlert": optional object { "platform": string, "title": string, "startTime": string, "hoursUntil": number },
  "recommendations": array of { "type": "review" | "weak_area" | "contest_prep" | "speed_drill", "title": string, "reason": string, "difficulty": string },
  "motivationalTip": string (concise, realistic)
}`;

  const userPrompt = `Telemetry Context:
- Weak Topics (<50% mastery): ${JSON.stringify(context.weakAreas.map((w) => `${w.title} (${w.percentage}%)`))}
- Spaced Repetition Due Today: ${context.reviewStats.dueToday} questions (${context.reviewStats.overdue} overdue)
- Daily Queue Size: ${context.dailyPlan.review.length + context.dailyPlan.weak.length + context.dailyPlan.random.length}
- Upcoming Contest within 48h: ${context.urgentContest ? `${context.urgentContest.platform}: ${context.urgentContest.title} at ${context.urgentContest.startTime}` : 'None'}
`;

  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: { responseMimeType: 'application/json' }
      }),
    });
    const json: any = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText) as AICoachPlan;
    }
  }

  throw new Error('LLM call failed');
};

const generateHeuristicCoachPlan = (context: Awaited<ReturnType<typeof getUserStudyContext>>): AICoachPlan => {
  const { weakAreas, reviewStats, urgentContest, dailyPlan } = context;

  const recommendations: AICoachPlan['recommendations'] = [];
  let headline = 'Steady Progress: Daily Spaced Repetition';
  let analysis = 'Maintaining consistent daily practice keeps solved problem patterns fresh in memory.';
  let targetMinutes = 60;

  let contestAlert: AICoachPlan['contestAlert'] = undefined;
  if (urgentContest) {
    const hoursUntil = Math.max(1, Math.round((new Date(urgentContest.startTime).getTime() - Date.now()) / (1000 * 3600)));
    contestAlert = {
      platform: urgentContest.platform,
      title: urgentContest.title,
      startTime: urgentContest.startTime,
      hoursUntil,
    };
    headline = `Contest in ${hoursUntil}h: Priority Drills on ${urgentContest.platform.toUpperCase()}`;
    analysis = `You have an upcoming ${urgentContest.platform} contest. Prioritize quick reviews and warm-up problems over heavy new topics.`;
    targetMinutes = 45;
    recommendations.push({
      type: 'contest_prep',
      title: 'Warm-up implementation drill',
      reason: 'Calibrate speed on string manipulation or two-pointer logic before contest starts',
      difficulty: 'Easy',
    });
  }

  if (reviewStats.dueToday > 0) {
    recommendations.push({
      type: 'review',
      title: `Clear ${Math.min(reviewStats.dueToday, 4)} due review items`,
      reason: 'Spaced repetition preserves problem-solving intuition and prevents retention decay',
      difficulty: 'Medium',
    });
  }

  if (weakAreas.length > 0) {
    const topWeak = weakAreas[0];
    if (!urgentContest) {
      headline = `Strengthen Weak Anchor: ${topWeak.title} (${topWeak.percentage}% mastery)`;
      analysis = `${topWeak.title} is currently your lowest mastery area. Tackling 2 focused problems today will balance your topic distribution.`;
    }
    recommendations.push({
      type: 'weak_area',
      title: `${topWeak.title} Pattern Drill`,
      reason: `Mastery is at ${topWeak.percentage}%. Target core patterns and sub-cases`,
      difficulty: 'Medium',
    });
  }

  if (dailyPlan.random.length > 0) {
    recommendations.push({
      type: 'speed_drill',
      title: dailyPlan.random[0].title || 'Unseen Problem Challenge',
      reason: 'Simulates real interview conditions with unprimed problem statement',
      difficulty: dailyPlan.random[0].difficulty || 'Medium',
    });
  }

  return {
    headline,
    analysis,
    targetMinutes,
    contestAlert,
    recommendations: recommendations.slice(0, 4),
    motivationalTip: 'Consistency beats intensity. 60 focused minutes beats 4 hours of passive reading.',
  };
};

export const getSocraticHint = async (
  userId: string,
  questionId: string,
  hintLevel: 1 | 2 | 3,
  userCode?: string,
  currentApproach?: string
): Promise<SocraticHintResponse> => {
  const question = await getQuestionById(userId, questionId);

  const levelNames: Record<1 | 2 | 3, SocraticHintResponse['levelName']> = {
    1: 'conceptual',
    2: 'complexity_edge_case',
    3: 'counter_example',
  };

  const levelName = levelNames[hintLevel];

  // If Gemini LLM available, generate customized Socratic response
  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    try {
      const hint = await generateLLMSocraticHint(question, hintLevel, levelName, userCode, currentApproach);
      // Guardrail verification
      if (CODE_LEAK_REGEX.test(hint.guidance)) {
        hint.guidance = 'Notice the fundamental recurrence relation: identify the state representation and what subproblems must be computed first.';
      }
      return hint;
    } catch {
      // Fallback to heuristic guidance
    }
  }

  return generateHeuristicHint(question, hintLevel, levelName);
};

const generateLLMSocraticHint = async (
  question: any,
  hintLevel: 1 | 2 | 3,
  levelName: SocraticHintResponse['levelName'],
  userCode?: string,
  currentApproach?: string
): Promise<SocraticHintResponse> => {
  const systemPrompt = `You are the AlgoForge Socratic DSA Tutor.
CRITICAL RULE: NEVER provide runnable code, full implementations, or complete solutions.
Your mission is to guide the candidate with Socratic inquiry:
- Level 1 (conceptual): Provide high-level intuition, analogy, and identify the algorithmic category (e.g. Two Pointers, Monotonic Stack, Topo Sort).
- Level 2 (complexity_edge_case): Highlight optimal Big-O target and warn about tricky edge cases (e.g. empty lists, overflow, duplicates).
- Level 3 (counter_example): Provide a minimal breaking test input and ask a question exposing why brute force or naive assumptions fail.

Return ONLY valid JSON matching this schema:
{
  "hintLevel": ${hintLevel},
  "levelName": "${levelName}",
  "guidance": string (2-3 sentences max, NO CODE BLOCKS),
  "complexityTarget": optional string (e.g. "O(N) Time, O(1) Space"),
  "counterExample": optional string (e.g. "[2, 1, 2] with target 4"),
  "thoughtPrompt": string (1 provocative question candidate should ask themselves)
}`;

  const promptContent = `Problem: ${question.title} (${question.difficulty || 'Medium'})
Platform: ${question.platform || 'LeetCode'}
User's Code Attempt: ${userCode ? `\`\`\`\n${userCode.slice(0, 1500)}\n\`\`\`` : 'None provided'}
User's Stated Approach: ${currentApproach || 'None stated'}
Requested Hint Level: ${hintLevel} (${levelName})`;

  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${promptContent}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    const json: any = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) return JSON.parse(rawText);
  }

  throw new Error('LLM hint call failed');
};

const generateHeuristicHint = (
  question: any,
  hintLevel: 1 | 2 | 3,
  levelName: SocraticHintResponse['levelName']
): SocraticHintResponse => {
  if (hintLevel === 1) {
    return {
      hintLevel: 1,
      levelName: 'conceptual',
      guidance: `Break down "${question.title}". Consider whether the optimal substructure allows solving smaller subproblems first, or if sorting/indexing unlocks a two-pointer invariant.`,
      thoughtPrompt: 'What invariant remains true as you iterate from left to right?',
    };
  }

  if (hintLevel === 2) {
    return {
      hintLevel: 2,
      levelName: 'complexity_edge_case',
      guidance: 'Watch out for boundary conditions: empty input arrays, negative integers, duplicate values, and potential 32-bit integer overflows.',
      complexityTarget: question.difficulty === 'Easy' ? 'O(N) Time, O(1) Space' : 'O(N log N) or O(N) Time',
      thoughtPrompt: 'Does your solution perform redundant lookups that a Hash Map or Precomputation could eliminate?',
    };
  }

  return {
    hintLevel: 3,
    levelName: 'counter_example',
    guidance: 'Test your logic against an edge case where greedy choices produce a suboptimal outcome.',
    counterExample: '[3, 1, 2, 4] with single-element partitions',
    thoughtPrompt: 'If all elements are identical, does your termination condition cleanly halt without an off-by-one error?',
  };
};
