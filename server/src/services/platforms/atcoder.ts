export const syncAtcoder = async (username: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // Fetch rating history
    const res = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_count?user=${encodeURIComponent(username)}`, {
      signal: controller.signal
    });
    
    // Fetch rating history
    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 10000);
    const ratingRes = await fetch(`https://atcoder.jp/users/${encodeURIComponent(username)}/history/json`, {
      signal: controller2.signal
    });

    clearTimeout(timeout);
    clearTimeout(timeout2);

    if (!res.ok && res.status !== 404) {
      throw new Error(`AtCoder API responded with status ${res.status}`);
    }
    
    let solvedCount = 0;
    if (res.ok) {
      const data = await res.json() as any;
      // Depending on the API, it might just return an integer or an object, wait, ac_count usually returns an array or object?
      // Wait, let's just fetch from AtCoder Problems
      // Oh, ac_count api actually returns { user_id, problem_count } 
      // or if it fails, maybe we just parse from the user page instead?
      // For simplicity, let's just try to parse the JSON.
      // But actually, the rating history JSON from atcoder.jp is very reliable for ratings!
    }

    // Let's scrape the official profile for solved count instead to be safe if kenkoooo is acting up
    // Actually, kenkoooo is needed for solved count since AtCoder doesn't show it natively easily on profile sometimes?
    // Let's just use the official AtCoder profile to get Rating!
    let rating = 0;
    let maxRating = 0;
    
    if (ratingRes.ok) {
       const history = await ratingRes.json() as any[];
       if (history && history.length > 0) {
          rating = history[history.length - 1].NewRating;
          maxRating = Math.max(...history.map(h => h.NewRating));
       }
    } else {
       if (ratingRes.status === 404) throw new Error('AtCoder user not found');
    }

    // For solved count, we will use kenkoooo
    // The endpoint is: https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_count?user=username
    // Response: {"user_id":"username","problem_count":123}
    if (res.ok) {
      try {
        const text = await res.text();
        const data = JSON.parse(text);
        if (data && data.problem_count) {
           solvedCount = data.problem_count;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    return { solvedCount, rating, maxRating };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('AtCoder API timed out. Please try again.');
    }
    if (error?.message?.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to fetch data from AtCoder. Please try again.');
  }
};
