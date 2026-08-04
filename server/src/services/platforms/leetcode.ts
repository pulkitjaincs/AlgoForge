export const syncLeetcode = async (username: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const query = `
    query getUserProfile($username: String!) {
      userContestRanking(username: $username) {
        rating
        topPercentage
        badge { name }
      }
      userContestRankingHistory(username: $username) {
        rating
      }
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AlgoForge-App'
      },
      body: JSON.stringify({
        query,
        variables: { username }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`LeetCode GraphQL responded with ${res.status}`);
    }

    const data = await res.json() as any;
    
    if (data.errors) {
      if (data.errors[0]?.message?.includes('not found') || data.errors[0]?.message?.includes('does not exist')) {
        throw new Error('LeetCode user not found');
      }
      throw new Error(data.errors[0].message);
    }

    const matchedUser = data?.data?.matchedUser;
    if (!matchedUser) {
      throw new Error('LeetCode user not found');
    }

    const stats = matchedUser.submitStats?.acSubmissionNum || [];
    const allStat = stats.find((s: any) => s.difficulty === 'All');
    const solvedCount = allStat ? allStat.count : 0;
    
    const ranking = data?.data?.userContestRanking;
    const rating = ranking ? Math.round(ranking.rating) : 0;
    const tier = ranking?.badge?.name || null;
    
    let maxRating = rating;
    const history = data?.data?.userContestRankingHistory;
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        if (h.rating) {
           const r = Math.round(h.rating);
           if (r > maxRating) maxRating = r;
        }
      });
    }
    
    // Parse calendar
    const activityData: { date: string, count: number }[] = [];
    try {
       const calendarStr = matchedUser.userCalendar?.submissionCalendar;
       if (calendarStr) {
          const calObj = JSON.parse(calendarStr);
          for (const [timestampStr, count] of Object.entries(calObj)) {
             const dateStr = new Date(parseInt(timestampStr, 10) * 1000).toISOString().split('T')[0];
             activityData.push({ date: dateStr, count: count as number });
          }
       }
    } catch(e) {
      console.warn('Failed to parse LeetCode calendar data', e);
    }

    return {
      solvedCount,
      rating,
      maxRating,
      tier,
      contributions: 0,
      activityData
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('LeetCode API timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
