export const syncCodeforces = async (username: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, {
      signal: controller.signal
    });
    
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) throw new Error('Codeforces user not found');
      throw new Error(`Codeforces API responded with ${res.status}`);
    }

    const data = await res.json() as any;
    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
      throw new Error('Codeforces user not found');
    }

    const user = data.result[0];
    
    // Codeforces doesn't have a direct "solved count" in user.info, we'd need user.status
    // Fetch user status to count solved
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}`, {
      signal: controller.signal
    });
    let solvedCount = 0;
    const activityData: { date: string, count: number }[] = [];

    if (statusRes.ok) {
      const statusData = await statusRes.json() as any;
      if (statusData.status === 'OK' && statusData.result) {
         // Unique solved problems
         const solvedSet = new Set();
         const dateCounts = new Map<string, number>();

         for (const submission of statusData.result) {
            if (submission.creationTimeSeconds) {
               const dateStr = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
               dateCounts.set(dateStr, (dateCounts.get(dateStr) || 0) + 1);
            }
            if (submission.verdict === 'OK') {
               solvedSet.add(submission.problem.name);
            }
         }
         solvedCount = solvedSet.size;

         for (const [date, count] of dateCounts.entries()) {
            activityData.push({ date, count });
         }
      }
    }

    return {
      solvedCount,
      rating: user.rating || 0,
      maxRating: user.maxRating || user.rating || 0,
      contributions: 0,
      activityData
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Codeforces API timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
