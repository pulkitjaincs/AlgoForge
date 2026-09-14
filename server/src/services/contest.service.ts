import { cache } from '../utils/cache.js';
import { prisma } from '../config/database.js';

export interface Contest {
  id: string;
  title: string;
  platform: 'leetcode' | 'codeforces' | 'codechef' | 'atcoder';
  url: string;
  startTime: string; // ISO date string
  durationSeconds: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface UserContestRating {
  platform: string;
  username: string;
  rating: number;
  maxRating: number;
  tier: string | null;
  lastSyncedAt: Date;
}

const fetchLeetcodeContests = async (): Promise<Contest[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AlgoForge-App',
      },
      body: JSON.stringify({
        query: '{ topTwoContests { title titleSlug startTime duration cardImg } }',
      }),
      signal: controller.signal,
    });

    if (!res.ok) return [];
    const data = (await res.json()) as any;
    const contests = data?.data?.topTwoContests;
    if (!Array.isArray(contests)) return [];

    const now = Date.now();
    return contests.map((c: any) => {
      const startMs = c.startTime * 1000;
      const endMs = startMs + c.duration * 1000;
      let status: 'UPCOMING' | 'LIVE' | 'COMPLETED' = 'UPCOMING';
      if (now >= startMs && now < endMs) {
        status = 'LIVE';
      } else if (now >= endMs) {
        status = 'COMPLETED';
      }

      return {
        id: `leetcode-${c.titleSlug}`,
        title: c.title,
        platform: 'leetcode',
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        startTime: new Date(startMs).toISOString(),
        durationSeconds: c.duration,
        status,
      };
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchCodeforcesContests = async (): Promise<Contest[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      signal: controller.signal,
    });

    if (!res.ok) return [];
    const data = (await res.json()) as any;
    if (data.status !== 'OK' || !Array.isArray(data.result)) return [];

    const upcoming = data.result
      .filter((c: any) => c.phase === 'BEFORE' || c.phase === 'CODING')
      .slice(0, 8);

    return upcoming.map((c: any) => {
      const status: 'UPCOMING' | 'LIVE' = c.phase === 'CODING' ? 'LIVE' : 'UPCOMING';
      return {
        id: `codeforces-${c.id}`,
        title: c.name,
        platform: 'codeforces',
        url: `https://codeforces.com/contest/${c.id}`,
        startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
        durationSeconds: c.durationSeconds,
        status,
      };
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

// Generates scheduled weekly contests for platforms with regular cadence (AtCoder & CodeChef)
const generateScheduledContests = (): Contest[] => {
  const contests: Contest[] = [];
  const now = new Date();

  // AtCoder: Every Saturday at 21:00 JST (12:00 UTC)
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    const day = d.getUTCDay();
    const diff = (6 - day + 7) % 7 + (i * 7);
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(12, 0, 0, 0);

    if (d.getTime() > now.getTime() - 6000 * 1000) {
      const duration = 6000; // 100 minutes
      const end = d.getTime() + duration * 1000;
      const status: 'UPCOMING' | 'LIVE' = now.getTime() >= d.getTime() && now.getTime() < end ? 'LIVE' : 'UPCOMING';
      contests.push({
        id: `atcoder-abc-${d.toISOString().slice(0, 10)}`,
        title: `AtCoder Beginner Contest ${390 + i}`,
        platform: 'atcoder',
        url: 'https://atcoder.jp/contests',
        startTime: d.toISOString(),
        durationSeconds: duration,
        status,
      });
    }
  }

  // CodeChef: Every Wednesday at 20:00 IST (14:30 UTC)
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    const day = d.getUTCDay();
    const diff = (3 - day + 7) % 7 + (i * 7);
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(14, 30, 0, 0);

    if (d.getTime() > now.getTime() - 7200 * 1000) {
      const duration = 7200; // 2 hours
      const end = d.getTime() + duration * 1000;
      const status: 'UPCOMING' | 'LIVE' = now.getTime() >= d.getTime() && now.getTime() < end ? 'LIVE' : 'UPCOMING';
      contests.push({
        id: `codechef-starters-${d.toISOString().slice(0, 10)}`,
        title: `CodeChef Starters ${175 + i}`,
        platform: 'codechef',
        url: 'https://www.codechef.com/contests',
        startTime: d.toISOString(),
        durationSeconds: duration,
        status,
      });
    }
  }

  return contests;
};

export const getUpcomingContests = async (platformFilter?: string, statusFilter?: string): Promise<Contest[]> => {
  const cacheKey = 'contests:upcoming:all';

  const allContests = await cache.getOrSet<Contest[]>(
    cacheKey,
    async () => {
      const [lc, cf] = await Promise.all([
        fetchLeetcodeContests(),
        fetchCodeforcesContests(),
      ]);

      const scheduled = generateScheduledContests();
      const combined = [...lc, ...cf, ...scheduled];

      // Sort by startTime ascending
      combined.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return combined;
    },
    900 // 15 minutes TTL
  );

  return (allContests || []).filter((c) => {
    if (platformFilter && platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (statusFilter && statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });
};

export const getUserContestRatings = async (userId: string): Promise<UserContestRating[]> => {
  const integrations = await prisma.platformIntegration.findMany({
    where: {
      userId,
      platform: {
        not: 'github',
      },
    },
    select: {
      platform: true,
      username: true,
      rating: true,
      maxRating: true,
      tier: true,
      lastSyncedAt: true,
    },
  });

  return integrations.map((i) => ({
    platform: i.platform,
    username: i.username,
    rating: i.rating,
    maxRating: i.maxRating,
    tier: i.tier,
    lastSyncedAt: i.lastSyncedAt,
  }));
};
