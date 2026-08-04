import * as cheerio from 'cheerio';

export const syncGithub = async (username: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`https://github.com/${encodeURIComponent(username)}?action=show&controller=profiles&tab=contributions&user_id=${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) throw new Error('GitHub user not found');
      throw new Error(`GitHub responded with status ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let contributions = 0;
    const contributionText = $('h2.f4.text-normal.mb-2').text();
    const match = contributionText.match(/([\d,]+)\s+contributions/i);
    
    if (match && match[1]) {
      contributions = parseInt(match[1].replace(/,/g, ''), 10);
    }

    // Attempt to parse heatmap from SVG or tool-tip spans (GitHub uses a new layout)
    // There's a table with class ContributionCalendar-grid or similar, but the easiest is just parsing the tooltips if they exist, or <rect class="ContributionCalendar-day" data-date="2023-01-01" data-level="1">
    // Actually github changed their graph to tooltips inside `<td class="ContributionCalendar-day">`
    const activityData: { date: string, count: number }[] = [];
    
    // Newer GitHub DOM structure: 
    // <td class="ContributionCalendar-day" data-date="2024-05-15" id="contribution-day-component-9-60" ...>
    //   <span class="sr-only">1 contribution on May 15th.</span>
    // </td>
    $('td.ContributionCalendar-day').each((_, el) => {
      const date = $(el).attr('data-date');
      const id = $(el).attr('id');
      if (date && id) {
         const tooltip = $(`tool-tip[for="${id}"]`);
         const text = tooltip.text();
         if (text) {
            let count = 0;
            const countMatch = text.match(/^(\d+|No)\s+contribution/i);
            if (countMatch) {
               count = countMatch[1].toLowerCase() === 'no' ? 0 : parseInt(countMatch[1], 10);
            }
            activityData.push({ date, count });
         }
      }
    });

    return {
      solvedCount: 0,
      rating: 0,
      maxRating: 0,
      contributions,
      activityData
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('GitHub scrape timed out. Please try again.');
    }
    if (error?.message?.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to fetch data from GitHub. Please try again.');
  }
};
