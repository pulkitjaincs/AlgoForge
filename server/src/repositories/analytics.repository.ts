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
  },

  async getHeatmapData(userId: string, year?: number) {
    return prisma.questionAttempt.findMany({
      where: {
        userId,
        ...(year ? {
          solvedAt: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59),
          }
        } : {}),
      },
      orderBy: { solvedAt: 'desc' },
      select: { solvedAt: true },
    });
  },

  async getVelocityData(userId: string, startDate: Date) {
    return prisma.questionAttempt.findMany({
      where: {
        userId,
        solvedAt: { gte: startDate },
      },
      orderBy: { solvedAt: 'desc' },
      select: { solvedAt: true },
    });
  },
};

