import * as cheerio from 'cheerio';

export const syncCodechef = async (username: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 404) throw new Error('CodeChef user not found');
      throw new Error(`CodeChef responded with status ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // If profile doesn't exist, codechef redirects or shows a specific message
    // Usually a 404 status handles it, but let's be safe
    if (html.includes('Could not find user')) {
      throw new Error('CodeChef user not found');
    }

    // Parse Rating
    const ratingText = $('.rating-number').text().trim();
    let rating = 0;
    if (ratingText && ratingText !== '?') {
      rating = parseInt(ratingText, 10);
    }

    // Parse Max Rating
    let maxRating = 0;
    const maxRatingText = $('.rating-header').text();
    const maxMatch = maxRatingText.match(/Highest Rating\s+(\d+)/i);
    if (maxMatch && maxMatch[1]) {
      maxRating = parseInt(maxMatch[1], 10);
    }

    // Parse Total Solved (Fully Solved)
    let solvedCount = 0;
    const solvedText = $('h3:contains("Fully Solved")').text();
    const solvedMatch = solvedText.match(/Fully Solved\s*\((\d+)\)/i);
    if (solvedMatch && solvedMatch[1]) {
      solvedCount = parseInt(solvedMatch[1], 10);
    }

    return { solvedCount, rating, maxRating };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('CodeChef timed out. Please try again.');
    }
    if (error?.message?.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to fetch data from CodeChef. Please try again.');
  }
};
