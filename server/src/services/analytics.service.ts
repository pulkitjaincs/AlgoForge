import { topicRepository } from '../repositories/topic.repository.js';
import { attemptRepository } from '../repositories/attempt.repository.js';

export const getSummary = async (userId: string) => {
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

  return { totalQuestions, solvedQuestions, difficultyStats, solvedByDifficulty };
};

export const getHeatmap = async (userId: string, year: number) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const attempts = await attemptRepository.findManyByUserIdInDateRange(userId, startDate, endDate);

  const heatmap: Record<string, number> = {};
  for (const a of attempts) {
    const dateStr = a.solvedAt.toISOString().split('T')[0];
    heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
  }

  return Object.entries(heatmap).map(([date, count]) => ({ date, count }));
};

export const getStreaks = async (userId: string) => {
  const attempts = await attemptRepository.findAllByUserId(userId);

  if (attempts.length === 0) return { currentStreak: 0, maxStreak: 0, lastActive: null };

  const uniqueDates = Array.from(new Set(attempts.map(a => a.solvedAt.toISOString().split('T')[0])));
  
  let currentStreak = 1;
  let maxStreak = 1;
  let current = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const d1 = new Date(uniqueDates[i]);
    const d2 = new Date(uniqueDates[i+1]);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
      if (i === 0 || currentStreak > 1) {
        currentStreak = current;
      }
    } else {
      current = 1;
      if (i === 0) currentStreak = 1;
    }
  }

  return { 
    currentStreak, 
    maxStreak, 
    lastActive: attempts[0].solvedAt 
  };
};

export const getTopicMastery = async (userId: string) => {
  const topics = await topicRepository.findManyWithAllQuestions(userId);

  return topics.map(topic => {
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
};

export const getWeakAreas = async (userId: string) => {
  const mastery = await getTopicMastery(userId);
  return mastery.filter(t => t.total > 0).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
};

export const getVelocity = async (userId: string, period: string = 'weekly') => {
  const today = new Date();
  const weeks = 8;
  const startDate = new Date(today.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const attempts = await attemptRepository.findManyFromDate(userId, startDate);

  const velocityMap: Record<string, number> = {};
  for (const a of attempts) {
    const d = a.solvedAt;
    const yearWeek = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`;
    velocityMap[yearWeek] = (velocityMap[yearWeek] || 0) + 1;
  }
  
  return Object.entries(velocityMap).map(([period, count]) => ({ period, count }));
};
