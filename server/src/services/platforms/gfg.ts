import * as cheerio from 'cheerio';

export const syncGfg = async (username: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`https://www.geeksforgeeks.org/user/${encodeURIComponent(username)}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 404) throw new Error('GeeksForGeeks user not found');
      throw new Error(`GFG responded with status ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // GFG doesn't have a 404 page for missing users sometimes, it just redirects or says user not found
    if (html.includes('User Doesn\'t Exist') || html.includes('Page Not Found')) {
      throw new Error('GeeksForGeeks user not found');
    }

    let solvedCount = 0;
    let rating = 0; // GFG doesn't have a standard competitive rating

    // Try to find the problems solved count
    // The exact selector depends on GFG's current layout, usually it's in a specific text node
    const problemSolvedText = $('.problem-solved-count').text() || $('div:contains("Problems Solved")').text();
    const match = problemSolvedText.match(/(?:Problems Solved|Total Problem Solved).*?(\d+)/i);
    
    if (match && match[1]) {
      solvedCount = parseInt(match[1], 10);
    } else {
      // Fallback: look for the scorecard section
      const scoreCards = $('.score_card_value');
      if (scoreCards.length >= 2) {
         // Usually second or third score card is total problems solved
         solvedCount = parseInt($(scoreCards[1]).text().trim(), 10) || 0;
      }
    }
    
    // GFG coding score might be used as a proxy for "rating", let's extract it if possible
    const scoreText = $('.score_card_value').first().text().trim();
    if (scoreText && !isNaN(parseInt(scoreText, 10))) {
       rating = parseInt(scoreText, 10);
    }

    return { solvedCount, rating, maxRating: rating };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('GeeksForGeeks timed out. Please try again.');
    }
    if (error?.message?.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to fetch data from GeeksForGeeks. Please try again.');
  }
};
