import React from 'react';
import { SiLeetcode, SiCodeforces, SiCodechef, SiGeeksforgeeks } from 'react-icons/si';
import { Activity, Github } from 'lucide-react';

export const PLATFORM_CONFIG: Record<string, { name: string, icon: React.ReactNode, color: string, bg: string, url: string }> = {
  leetcode: { name: 'LeetCode', icon: <SiLeetcode className="w-5 h-5 text-[#FFA116]" />, color: '#FFA116', bg: 'bg-[#FFA116]/10', url: 'https://leetcode.com/u/' },
  codeforces: { name: 'Codeforces', icon: <SiCodeforces className="w-5 h-5 text-[#1F8ACB]" />, color: '#1F8ACB', bg: 'bg-[#1F8ACB]/10', url: 'https://codeforces.com/profile/' },
  codechef: { name: 'CodeChef', icon: <SiCodechef className="w-5 h-5 text-[#5B4638]" />, color: '#5B4638', bg: 'bg-[#5B4638]/10', url: 'https://www.codechef.com/users/' },
  gfg: { name: 'GeeksForGeeks', icon: <SiGeeksforgeeks className="w-5 h-5 text-[#2F8D46]" />, color: '#2F8D46', bg: 'bg-[#2F8D46]/10', url: 'https://www.geeksforgeeks.org/user/' },
  atcoder: { name: 'AtCoder', icon: <Activity className="w-5 h-5 text-red-500" />, color: '#ef4444', bg: 'bg-red-500/10', url: 'https://atcoder.jp/users/' },
  github: { name: 'GitHub', icon: <Github className="w-5 h-5 text-text-main" />, color: 'var(--text-main)', bg: 'bg-text-main/10', url: 'https://github.com/' },
};

export const getPlatformLabel = (platform: string, rating: number, tier?: string) => {
  if (platform === 'leetcode' && tier) {
     return { label: tier, color: tier.toLowerCase() === 'guardian' ? '#eb3b3b' : '#2cbb5d' };
  }
  if (!rating || rating <= 0) return null;
  switch (platform) {
    case 'codeforces':
      if (rating < 1200) return { label: 'Newbie', color: '#808080' };
      if (rating < 1400) return { label: 'Pupil', color: '#008000' };
      if (rating < 1600) return { label: 'Specialist', color: '#03A89E' };
      if (rating < 1900) return { label: 'Expert', color: '#0000FF' };
      if (rating < 2100) return { label: 'Candidate Master', color: '#AA00AA' };
      if (rating < 2300) return { label: 'Master', color: '#FF8C00' };
      if (rating < 2400) return { label: 'Int. Master', color: '#FF8C00' };
      if (rating < 2600) return { label: 'Grandmaster', color: '#FF0000' };
      if (rating < 3000) return { label: 'Int. Grandmaster', color: '#FF0000' };
      return { label: 'Legendary GM', color: '#FF0000' };
    case 'codechef':
      if (rating < 1400) return { label: '1★', color: '#666666' };
      if (rating < 1600) return { label: '2★', color: '#666666' };
      if (rating < 1800) return { label: '3★', color: '#3366cc' };
      if (rating < 2000) return { label: '4★', color: '#684273' };
      if (rating < 2200) return { label: '5★', color: '#ffbf00' };
      if (rating < 2500) return { label: '6★', color: '#ff7f00' };
      return { label: '7★', color: '#d0011b' };
    case 'leetcode':
      if (rating >= 2150) return { label: 'Guardian', color: '#eb3b3b' };
      if (rating >= 1850) return { label: 'Knight', color: '#2cbb5d' };
      return null;
    default:
      return null;
  }
};
