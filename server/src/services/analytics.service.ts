import { topicRepository } from '../repositories/topic.repository.js';
import { attemptRepository } from '../repositories/attempt.repository.js';
import { cache } from '../utils/cache.js';

export const getSummary = async (userId: string) => {
  const cacheKey = `analytics_summary:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const topics = await topicRepository.findManyWithAllQuestions(userId);

  let totalQuestions = 0;
  let solvedQuestions = 0;
  const difficultyStats = { Easy: 0, Medium: 0, Hard: 0, Basic: 0 };
  const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0, Basic: 0 };

  for (const topic of topics) {
    const allQuestions = [...topic.questions];
    for (const st of topic.subTopics) {
      allQuestions.push(...st.questions);
    }
    
    totalQuestions += allQuestions.length;
    for (const q of allQuestions) {
      if (q.isSolved) solvedQuestions++;
      
      const diff = q.difficulty || 'Medium';
      if (diff in difficultyStats) {
        difficultyStats[diff as keyof typeof difficultyStats]++;
        if (q.isSolved) {
          solvedByDifficulty[diff as keyof typeof solvedByDifficulty]++;
        }
      }
    }
  }

  const result = { totalQuestions, solvedQuestions, difficultyStats, solvedByDifficulty };
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getHeatmap = async (userId: string, year?: number) => {
  const cacheKey = `analytics_heatmap:${userId}:${year || 'all'}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  let attempts;
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    attempts = await attemptRepository.findAttempts(userId, { startDate, endDate });
  } else {
    attempts = await attemptRepository.findAttempts(userId);
  }

  const heatmap: Record<string, number> = {};
  for (const a of attempts) {
    const dateStr = a.solvedAt.toISOString().split('T')[0];
    heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
  }

  const result = Object.entries(heatmap).map(([date, count]) => ({ date, count }));
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getStreaks = async (userId: string) => {
  const cacheKey = `analytics_streaks:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const attempts = await attemptRepository.findAttempts(userId);

  if (attempts.length === 0) {
    const result = { currentStreak: 0, maxStreak: 0, lastActive: null };
    await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
    return result;
  }

  const uniqueDates = Array.from(new Set(attempts.map(a => a.solvedAt.toISOString().split('T')[0])));
  
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const d1 = new Date(uniqueDates[i]);
    const d2 = new Date(uniqueDates[i+1]);
    const diffDays = Math.round(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1 && i + 1 === currentStreak) {
      currentStreak++;
    }
  }

  let tempStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const d1 = new Date(uniqueDates[i]);
    const d2 = new Date(uniqueDates[i+1]);
    const diffDays = Math.round(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)); 
    if (diffDays === 1) {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    currentStreak = 0;
  }

  const result = { 
    currentStreak, 
    maxStreak, 
    lastActive: attempts[0].solvedAt 
  };
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getTopicMastery = async (userId: string) => {
  const cacheKey = `analytics_topic_mastery:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const topics = await topicRepository.findManyWithAllQuestions(userId);

  const result = topics.map(topic => {
    let total = topic.questions.length;
    let solved = topic.questions.filter(q => q.isSolved).length;
    
    for (const st of topic.subTopics) {
      total += st.questions.length;
      solved += st.questions.filter(q => q.isSolved).length;
    }

    return {
      topicId: topic.id,
      title: topic.title,
      total,
      solved,
      percentage: total === 0 ? 0 : Math.round((solved / total) * 100)
    };
  });

  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getWeakAreas = async (userId: string) => {
  const cacheKey = `analytics_weak_areas:${userId}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const mastery = await getTopicMastery(userId);
  type MasteryEntry = { topicId: string; title: string; total: number; solved: number; percentage: number };
  const result = (mastery as MasteryEntry[]).filter(t => t.total > 0).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
  
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};

export const getVelocity = async (userId: string, period: string = 'weekly') => {
  const cacheKey = `analytics_velocity:${userId}:${period}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached as any;

  const today = new Date();
  const weeks = 8;
  const startDate = new Date(today.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const attempts = await attemptRepository.findAttempts(userId, { startDate });

  const velocityMap: Record<string, number> = {};
  for (const a of attempts) {
    const d = a.solvedAt;
    const yearWeek = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`;
    velocityMap[yearWeek] = (velocityMap[yearWeek] || 0) + 1;
  }
  
  const result = Object.entries(velocityMap).map(([period, count]) => ({ period, count }));
  await cache.setWithTag(cacheKey, `user:${userId}`, result, 300);
  return result;
};
