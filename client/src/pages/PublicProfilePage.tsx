import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { Calendar, User, ArrowLeft, Target, Zap, Activity, Github, Trophy } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { SiLeetcode, SiCodeforces, SiCodechef, SiGeeksforgeeks } from 'react-icons/si';

const PLATFORM_CONFIG: Record<string, { name: string, icon: any, color: string, bg: string, url: string }> = {
  leetcode: { name: 'LeetCode', icon: <SiLeetcode className="w-5 h-5 text-[#FFA116]" />, color: '#FFA116', bg: 'bg-[#FFA116]/10', url: 'https://leetcode.com/u/' },
  codeforces: { name: 'Codeforces', icon: <SiCodeforces className="w-5 h-5 text-[#1F8ACB]" />, color: '#1F8ACB', bg: 'bg-[#1F8ACB]/10', url: 'https://codeforces.com/profile/' },
  codechef: { name: 'CodeChef', icon: <SiCodechef className="w-5 h-5 text-[#5B4638]" />, color: '#5B4638', bg: 'bg-[#5B4638]/10', url: 'https://www.codechef.com/users/' },
  gfg: { name: 'GeeksForGeeks', icon: <SiGeeksforgeeks className="w-5 h-5 text-[#2F8D46]" />, color: '#2F8D46', bg: 'bg-[#2F8D46]/10', url: 'https://www.geeksforgeeks.org/user/' },
  atcoder: { name: 'AtCoder', icon: <Activity className="w-5 h-5 text-red-500" />, color: '#ef4444', bg: 'bg-red-500/10', url: 'https://atcoder.jp/users/' },
  github: { name: 'GitHub', icon: <Github className="w-5 h-5 text-text-main" />, color: 'var(--text-main)', bg: 'bg-text-main/10', url: 'https://github.com/' },
};

const getPlatformLabel = (platform: string, rating: number, tier?: string) => {
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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(username || '');

  const aggregateStats = useMemo(() => {
    let totalSolved = profile?.stats?.solvedQuestions || 0;
    let peakRating = 0;
    let peakPlatform = '';
    let githubContributions = 0;

    profile?.integrations?.forEach((int: any) => {
      if (int.platform === 'github') {
        githubContributions += int.contributions || 0;
      } else {
        totalSolved += int.solvedCount || 0;
        if ((int.maxRating || 0) > peakRating) {
          peakRating = int.maxRating;
          peakPlatform = int.platform;
        }
      }
    });

    return { totalSolved, peakRating, peakPlatform, githubContributions };
  }, [profile]);

  const combinedHeatmap = useMemo(() => {
    if (!profile) return [];
    const map = new Map<string, { count: number, platforms: Record<string, number> }>();
    
    profile.heatmap?.forEach((h: any) => {
      const existing = map.get(h.date) || { count: 0, platforms: {} };
      existing.count += h.count;
      existing.platforms['local'] = (existing.platforms['local'] || 0) + h.count;
      map.set(h.date, existing);
    });

    profile.integrations?.forEach((int: any) => {
      let data = int.activityData;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) { data = []; }
      }
      if (Array.isArray(data)) {
        data.forEach((h: any) => {
          const existing = map.get(h.date) || { count: 0, platforms: {} };
          existing.count += h.count;
          existing.platforms[int.platform] = (existing.platforms[int.platform] || 0) + h.count;
          map.set(h.date, existing);
        });
      }
    });

    return Array.from(map.entries()).map(([date, val]) => ({ date, count: val.count, platforms: val.platforms }));
  }, [profile]);

  const computedStreaks = useMemo(() => {
    if (!combinedHeatmap || combinedHeatmap.length === 0) return { currentStreak: 0, maxStreak: 0 };
    
    const sortedDates = combinedHeatmap
      .filter(h => h.count > 0)
      .map(h => h.date)
      .sort();
      
    if (sortedDates.length === 0) return { currentStreak: 0, maxStreak: 0 };

    let currentStreak = 1;
    let maxStreak = 1;
    let current = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current++;
        if (current > maxStreak) maxStreak = current;
      } else {
        current = 1;
      }
    }

    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() !== today.toDateString() && lastDate.toDateString() !== yesterday.toDateString()) {
      currentStreak = 0;
    } else {
      currentStreak = current;
    }

    return { currentStreak, maxStreak };
  }, [combinedHeatmap]);

  const { startDate, endDate, daysDiff } = useMemo(() => {
    const end = new Date();
    let start = new Date();
    const heatmapRange = profile?.defaultHeatmapRange || '1year';
    
    if (heatmapRange === '6months') {
      start.setMonth(start.getMonth() - 6);
    } else if (heatmapRange === '1year') {
      start.setFullYear(start.getFullYear() - 1);
    } else {
      const year = parseInt(heatmapRange);
      if (!isNaN(year)) {
        start = new Date(year, 0, 1);
        end.setFullYear(year, 11, 31);
      } else {
        start.setFullYear(start.getFullYear() - 1);
      }
    }
    const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return { startDate: start, endDate: end, daysDiff };
  }, [profile?.defaultHeatmapRange]);

  if (isLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-text-muted animate-fade-in bg-bg-dark">
      <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="font-medium">Loading profile...</p>
    </div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-bg-dark">
        <Helmet><title>Profile Not Found</title></Helmet>
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-6 border border-danger/20">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-2">Profile Not Found</h1>
        <p className="text-text-muted mb-8 max-w-md">This profile might not exist, or the user has set their profile to private.</p>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 animate-fade-in bg-bg-dark">
      <Helmet>
        <title>{profile.name} (@{profile.username}) - AlgoForge</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header Profile Card */}
        <div className="card p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-32 h-32 rounded-full border border-border-dark object-cover z-10 bg-bg-elevated" />
          ) : (
            <div className="w-32 h-32 rounded-full border border-brand-primary/30 bg-brand-primary/10 text-brand-primary flex items-center justify-center text-5xl font-bold z-10">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 z-10">
            <h1 className="text-3xl font-bold text-text-main">{profile.name}</h1>
            <p className="text-brand-primary font-medium mb-4">@{profile.username}</p>
            <p className="text-text-muted mb-6 leading-relaxed max-w-lg">{profile.bio || "This user hasn't written a bio yet."}</p>
            
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-2 text-sm text-text-muted bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dark">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-xl flex items-center gap-4 border border-brand-primary/20 bg-gradient-to-br from-bg-elevated to-brand-primary/5">
            <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20"><Target className="text-brand-primary w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{aggregateStats.totalSolved}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Total Solved</p>
            </div>
          </div>

          <div className="glass p-4 rounded-xl flex items-center gap-4 border border-warning/20 bg-gradient-to-br from-bg-elevated to-warning/5">
            <div className="p-3 bg-warning/10 rounded-xl border border-warning/20"><Zap className="text-warning w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{computedStreaks.currentStreak}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Current Streak</p>
            </div>
          </div>
          <div className="glass p-4 rounded-xl flex items-center gap-4 border border-success/20 bg-gradient-to-br from-bg-elevated to-success/5">
            <div className="p-3 bg-success/10 rounded-xl border border-success/20"><Activity className="text-success w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-bold text-text-main">{computedStreaks.maxStreak}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Max Streak</p>
            </div>
          </div>
          {(() => {
            const githubUsername = profile?.integrations?.find((i: any) => i.platform === 'github')?.username;
            const CardWrapper = githubUsername ? 'a' : 'div';
            const cardProps = githubUsername ? { href: `https://github.com/${githubUsername}`, target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <CardWrapper {...cardProps as any} className={`glass p-4 rounded-xl flex items-center gap-4 border border-border-dark bg-gradient-to-br from-bg-elevated to-text-main/5 ${githubUsername ? 'hover:border-text-main/30 cursor-pointer transition-colors' : ''}`}>
                <div className="p-3 bg-text-main/10 rounded-xl border border-text-main/20"><Github className="text-text-main w-6 h-6" /></div>
                <div>
                  <p className="text-2xl font-bold text-text-main">{aggregateStats.githubContributions}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    {githubUsername ? `GitHub (@${githubUsername})` : 'GitHub'}
                  </p>
                </div>
              </CardWrapper>
            );
          })()}
        </div>

        {/* Heatmap */}
        <div className="card p-6 border-border-dark">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" /> Activity Heatmap
            </h3>
            <div className="text-sm text-text-muted bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dark">
              {profile.defaultHeatmapRange === '6months' ? 'Past 6 Months' : profile.defaultHeatmapRange === '1year' ? 'Past 1 Year' : `Year ${profile.defaultHeatmapRange}`}
            </div>
          </div>
          <div className="w-full text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-main)', padding: 20, borderRadius: 8, border: '1px solid var(--border-dark)' }}>
            <div style={{ width: `${Math.max(300, Math.ceil(daysDiff / 7) * 15 + 40)}px` }}>
              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={combinedHeatmap}
                classForValue={(value) => {
                  if (!value || value.count === 0) return 'color-empty';
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                titleForValue={(value) => {
                  if (!value || value.count === 0) return 'No activity';
                  let text = `${value.count} total on ${value.date}`;
                  if (value.platforms) {
                    const breakdown = Object.entries(value.platforms)
                      .map(([p, c]) => `${c} ${p === 'github' ? 'commits' : 'submissions'} on ${p}`)
                      .join('\n');
                    if (breakdown) text += `\n\n${breakdown}`;
                  }
                  return text;
                }}
              />
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        {profile.integrations && profile.integrations.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {profile.integrations.filter((i: any) => i.platform !== 'github').map((integration: any) => {
              const config = PLATFORM_CONFIG[integration.platform] || { name: integration.platform, icon: <Activity className="w-5 h-5 text-text-muted" />, color: '#888', bg: 'bg-white/10', url: '#' };
              const rankInfo = getPlatformLabel(integration.platform, integration.rating, integration.tier);
              return (
                <a key={integration.platform} href={`${config.url}${integration.username}`} target="_blank" rel="noopener noreferrer" className="glass p-5 rounded-xl border border-border-dark min-w-[280px] shrink-0 snap-start relative overflow-hidden group hover:border-brand-primary/50 transition-colors block cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: rankInfo?.color || config.color }}></div>
                  <div className="flex items-center justify-between gap-3 mb-4 pl-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main group-hover:text-brand-primary transition-colors">{config.name}</h4>
                        <p className="text-xs text-text-muted">@{integration.username}</p>
                      </div>
                    </div>
                    {rankInfo && (
                      <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: rankInfo.color }}>
                        {rankInfo.label}
                      </div>
                    )}
                  </div>
                  
                  <div className={`grid ${integration.maxRating > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-6 pl-2`}>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Solved</p>
                      <p className="text-xl font-bold text-text-main">{integration.solvedCount}</p>
                    </div>
                    {integration.rating > 0 && (
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Rating</p>
                        <p className="text-xl font-bold" style={{ color: rankInfo?.color || 'var(--text-main)' }}>{integration.rating}</p>
                      </div>
                    )}
                    {integration.maxRating > 0 && (
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Peak</p>
                        <p className="text-xl font-bold text-text-main">{integration.maxRating}</p>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
