import React, { useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useUser } from '../hooks/useAuth';
import { useAnalyticsSummary, useAnalyticsStreaks, useTopicMastery, useWeakAreas, useVelocity, useAnalyticsHeatmap } from '../hooks/useAnalytics';
import { useIntegrations, useIntegrationHeatmap } from '../hooks/useIntegrations';
import { useDailyPlan } from '../hooks/usePractice';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from 'recharts';
import { Activity, Target, Zap, Clock, Code2, TerminalSquare, Github, Trophy, Plus, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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

export default function DashboardPage() {
  const { data: summary } = useAnalyticsSummary();
  const { data: streaks } = useAnalyticsStreaks();
  const { data: mastery } = useTopicMastery();
  const { data: weakAreas } = useWeakAreas();
  const { data: velocity } = useVelocity();
  const { data: user } = useUser();
  const [heatmapRange, setHeatmapRange] = useState(user?.defaultHeatmapRange || '1year');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.defaultHeatmapRange) {
      setHeatmapRange(user.defaultHeatmapRange);
    }
  }, [user?.defaultHeatmapRange]);

  const updateRangeMutation = useMutation({
    mutationFn: (range: string) => usersApi.updateProfile({ defaultHeatmapRange: range }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setHeatmapRange(val);
    updateRangeMutation.mutate(val);
  };

  const { data: heatmap } = useAnalyticsHeatmap();
  const { data: dailyPlan } = useDailyPlan();
  const { data: integrations } = useIntegrations();
  const { data: integrationHeatmap } = useIntegrationHeatmap();

  const isLoading = !summary || !streaks || !mastery || !weakAreas || !velocity || !heatmap || !dailyPlan;

  const aggregateStats = useMemo(() => {
    let totalSolved = summary?.solvedQuestions || 0;
    let peakRating = 0;
    let peakPlatform = '';
    let githubContributions = 0;

    integrations?.forEach(int => {
      if (int.platform === 'github') {
        githubContributions += int.contributions;
      } else {
        totalSolved += int.solvedCount;
        if (int.maxRating > peakRating) {
          peakRating = int.maxRating;
          peakPlatform = int.platform;
        }
      }
    });

    return { totalSolved, peakRating, peakPlatform, githubContributions };
  }, [summary, integrations]);

  const combinedHeatmap = useMemo(() => {
    const map = new Map<string, { count: number, platforms: Record<string, number> }>();
    
    // Add local heatmap
    heatmap?.forEach((h: any) => {
      const existing = map.get(h.date) || { count: 0, platforms: {} };
      existing.count += h.count;
      existing.platforms['local'] = (existing.platforms['local'] || 0) + h.count;
      map.set(h.date, existing);
    });

    // Add integrations heatmap
    integrationHeatmap?.forEach((h: any) => {
      const existing = map.get(h.date) || { count: 0, platforms: {} };
      existing.count += h.count;
      if (h.platforms) {
        Object.entries(h.platforms).forEach(([p, c]) => {
          existing.platforms[p] = (existing.platforms[p] || 0) + (c as number);
        });
      }
      map.set(h.date, existing);
    });

    return Array.from(map.entries()).map(([date, val]) => ({ date, count: val.count, platforms: val.platforms }));
  }, [heatmap, integrationHeatmap]);

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

  const heatmapYears = useMemo(() => {
    const years = new Set<number>();
    combinedHeatmap.forEach(h => years.add(new Date(h.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [combinedHeatmap]);

  const { startDate, endDate, daysDiff } = useMemo(() => {
    const end = new Date();
    let start = new Date();
    if (heatmapRange === '6months') {
      start.setMonth(start.getMonth() - 6);
    } else if (heatmapRange === '1year') {
      start.setFullYear(start.getFullYear() - 1);
    } else {
      const year = parseInt(heatmapRange);
      start = new Date(year, 0, 1);
      end.setFullYear(year, 11, 31);
    }
    const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return { startDate: start, endDate: end, daysDiff };
  }, [heatmapRange]);

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center space-y-4 text-text-muted animate-fade-in">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p className="font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  const difficultyData = [
    { name: 'Easy', value: summary.solvedByDifficulty.Easy || 0, color: '#10b981' },
    { name: 'Medium', value: summary.solvedByDifficulty.Medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: summary.solvedByDifficulty.Hard || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const radarData = mastery.map((t: any) => ({
    subject: t.title,
    A: t.percentage,
    fullMark: 100,
  }));

  const lineData = velocity.map((v: any) => ({ name: v.period, solved: v.count }));

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-main">Analytics Dashboard</h1>
          <Link to="/app/integrations" className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Link Platform
          </Link>
        </div>
        
        {/* Row 1: Hero Stats Bar */}
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
            const githubUsername = integrations?.find(i => i.platform === 'github')?.username;
            const CardWrapper = githubUsername ? 'a' : 'div';
            const cardProps = githubUsername ? { href: `https://github.com/${githubUsername}`, target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <CardWrapper {...cardProps as any} className={`glass p-4 rounded-xl flex items-center gap-4 border border-border-dark bg-gradient-to-br from-bg-elevated to-text-main/5 ${githubUsername ? 'hover:border-text-main/30 cursor-pointer transition-colors' : ''}`}>
                <div className="p-3 bg-text-main/10 rounded-xl border border-text-main/20"><Github className="text-text-main w-6 h-6" /></div>
                <div>
                  <p className="text-2xl font-bold text-text-main">{aggregateStats.githubContributions}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    {githubUsername ? `GitHub (@${githubUsername})` : 'GitHub Contributions'}
                  </p>
                </div>
              </CardWrapper>
            );
          })()}
        </div>

        {/* Row 2: Heatmap */}
        <div className="glass p-6 rounded-xl border-border-dark">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" /> Cross-Platform Activity
            </h3>
            <select
              value={heatmapRange}
              onChange={handleRangeChange}
              className="bg-bg-elevated border border-border-dark text-text-main text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2"
            >
              <option value="6months">Past 6 Months</option>
              <option value="1year">Past 1 Year</option>
              {heatmapYears.map(y => (
                <option key={y} value={y.toString()}>Year {y}</option>
              ))}
            </select>
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

        {/* Row 3: Platform Cards */}
        {integrations && integrations.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {integrations.filter(i => i.platform !== 'github').map(integration => {
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
                  <div className={`grid ${integration.platform === 'github' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 pl-2`}>
                    <div>
                      <p className="text-xl font-bold text-text-main">{integration.solvedCount}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Solved</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-text-main">
                        {integration.platform === 'github' ? integration.contributions : (integration.rating || 'N/A')}
                      </p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        {integration.platform === 'github' ? 'Contribs' : 'Rating'}
                      </p>
                    </div>
                    {integration.platform !== 'github' && (
                      <div>
                        <p className="text-xl font-bold text-text-main">
                          {integration.maxRating != null && integration.maxRating > 0 ? integration.maxRating : 'N/A'}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                          Peak
                        </p>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Row 4: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-xl border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Weekly Velocity (Local)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dark)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                  <Line type="monotone" dataKey="solved" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--brand-primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Difficulty Distribution (Local)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={difficultyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 5: Mastery & Practice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-6 rounded-xl border-border-dark">
            <h3 className="text-lg font-semibold mb-4 text-text-main">Topic Mastery</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border-dark)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{fontSize: 10}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-dark)" />
                  <Radar name="Mastery %" dataKey="A" stroke="var(--brand-accent)" fill="var(--brand-accent)" fillOpacity={0.5} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-dark)', color: 'var(--text-main)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass p-6 rounded-xl border-brand-primary/20 bg-gradient-to-br from-bg-elevated to-brand-primary/5 flex flex-col">
            <h3 className="text-lg font-semibold mb-6 text-brand-primary flex items-center gap-2">
              <Zap className="w-5 h-5" /> Focus & Practice Plan
            </h3>
            
            <div className="flex-1 space-y-6">
              {weakAreas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Top Priority Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {weakAreas.slice(0, 3).map((w: any) => (
                      <div key={w.topicId} className="px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-md text-sm text-warning font-medium">
                        {w.title} ({w.percentage}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Today's Queue</h4>
                <div className="space-y-2">
                  {[...dailyPlan.review, ...dailyPlan.weak, ...dailyPlan.random].slice(0, 5).map((q: any) => (
                    <Link key={q.id} to={`/app/practice/${q.id}`} className="flex items-center justify-between p-3 bg-bg-dark border border-border-dark rounded-lg hover:border-brand-primary/50 transition-colors group">
                      <span className="text-sm font-medium text-text-main group-hover:text-brand-primary transition-colors">{q.title}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
                    </Link>
                  ))}
                  {dailyPlan.review.length === 0 && dailyPlan.weak.length === 0 && dailyPlan.random.length === 0 && (
                    <p className="text-text-muted text-sm italic p-4 text-center border border-dashed border-border-dark rounded-lg">No questions in queue. Great job!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
