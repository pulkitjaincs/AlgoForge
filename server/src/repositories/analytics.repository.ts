import { prisma } from '../config/database.js';

export const analyticsRepository = {
  async getSummaryStats(userId: string) {
    const rawResult = await prisma.$queryRaw<
      { difficulty: string; total: bigint; solved: bigint }[]
    >`
      SELECT 
        q.difficulty, 
        COUNT(*) as total, 
        SUM(CASE WHEN q."isSolved" THEN 1 ELSE 0 END) as solved
      FROM "Question" q
      LEFT JOIN "Topic" t ON q."topicId" = t.id
      LEFT JOIN "SubTopic" st ON q."subTopicId" = st.id
      LEFT JOIN "Topic" st_t ON st."topicId" = st_t.id
      WHERE (t."userId" = ${userId} OR st_t."userId" = ${userId})
        AND q."deletedAt" IS NULL
        AND (t.id IS NULL OR t."deletedAt" IS NULL)
        AND (st.id IS NULL OR st."deletedAt" IS NULL)
        AND (st_t.id IS NULL OR st_t."deletedAt" IS NULL)
      GROUP BY q.difficulty;
    `;

    return rawResult.map((row) => ({
      difficulty: row.difficulty,
      total: Number(row.total),
      solved: Number(row.solved),
    }));
  },

  async getStreaks(userId: string) {
    // Computes streaks by distinct date
    const rawResult = await prisma.$queryRaw<
      { current_streak: number; max_streak: number; last_active: Date | null }[]
    >`
      WITH attempt_dates AS (
        SELECT DISTINCT DATE_TRUNC('day', "solvedAt") AS active_date
        FROM "QuestionAttempt"
        WHERE "userId" = ${userId}
      ),
      date_groups AS (
        SELECT 
          active_date,
          active_date - (ROW_NUMBER() OVER(ORDER BY active_date) * INTERVAL '1 day') AS grp
        FROM attempt_dates
      ),
      streaks AS (
        SELECT 
          COUNT(*) AS streak_length,
          MAX(active_date) AS streak_end
        FROM date_groups
        GROUP BY grp
      )
      SELECT 
        COALESCE(MAX(streak_length), 0)::integer AS max_streak,
        COALESCE((
          SELECT streak_length 
          FROM streaks 
          WHERE streak_end >= DATE_TRUNC('day', NOW() - INTERVAL '1 day')
          ORDER BY streak_end DESC 
          LIMIT 1
        ), 0)::integer AS current_streak,
        (SELECT MAX(active_date) FROM attempt_dates) AS last_active
      FROM streaks;
    `;
    
    return rawResult[0] || { current_streak: 0, max_streak: 0, last_active: null };
  },

  async getTopicMastery(userId: string) {
    const rawResult = await prisma.$queryRaw<
      { topic_id: string; title: string; total: bigint; solved: bigint }[]
    >`
      SELECT 
        COALESCE(t.id, st_t.id) as topic_id,
        COALESCE(t.title, st_t.title) as title,
        COUNT(q.id) as total,
        SUM(CASE WHEN q."isSolved" THEN 1 ELSE 0 END) as solved
      FROM "Question" q
      LEFT JOIN "Topic" t ON q."topicId" = t.id
      LEFT JOIN "SubTopic" st ON q."subTopicId" = st.id
      LEFT JOIN "Topic" st_t ON st."topicId" = st_t.id
      WHERE (t."userId" = ${userId} OR st_t."userId" = ${userId})
        AND q."deletedAt" IS NULL
        AND (t.id IS NULL OR t."deletedAt" IS NULL)
        AND (st.id IS NULL OR st."deletedAt" IS NULL)
        AND (st_t.id IS NULL OR st_t."deletedAt" IS NULL)
      GROUP BY COALESCE(t.id, st_t.id), COALESCE(t.title, st_t.title)
    `;

    return rawResult.map((row) => ({
      topicId: row.topic_id,
      title: row.title,
      total: Number(row.total),
      solved: Number(row.solved),
      percentage: Number(row.total) === 0 ? 0 : Math.round((Number(row.solved) / Number(row.total)) * 100),
    }));
  }
};
