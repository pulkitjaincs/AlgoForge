import React, { useMemo, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useUser } from '../hooks/useAuth';
import { useAnalyticsSummary, useTopicMastery, useWeakAreas, useVelocity, useAnalyticsHeatmap } from '../hooks/useAnalytics';
import { useIntegrations, useIntegrationHeatmap } from '../hooks/useIntegrations';
import { useDailyPlan } from '../hooks/usePractice';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HeroStatsBar } from '../components/features/dashboard/HeroStatsBar';
import { ActivityHeatmap } from '../components/features/dashboard/ActivityHeatmap';
import { PlatformCards } from '../components/features/dashboard/PlatformCards';
import { Charts } from '../components/features/dashboard/Charts';
import { FocusPlan } from '../components/features/dashboard/FocusPlan';

export default function DashboardPage() {
  const { data: summary } = useAnalyticsSummary();
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

  const isLoading = !summary || !mastery || !weakAreas || !velocity || !heatmap || !dailyPlan;

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
    heatmap?.forEach((h: { date: string; count: number }) => {
      const existing = map.get(h.date) || { count: 0, platforms: {} };
      existing.count += h.count;
      existing.platforms['local'] = (existing.platforms['local'] || 0) + h.count;
      map.set(h.date, existing);
    });

    // Add integrations heatmap
    integrationHeatmap?.forEach((h: { date: string; count: number; platforms?: Record<string, number> }) => {
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

  const heatmapYears = useMemo(() => {
    const years = new Set<number>();
    combinedHeatmap.forEach(h => years.add(new Date(h.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [combinedHeatmap]);

  const computedStreaks = useMemo(() => {
    const sortedDates = [...combinedHeatmap]
      .filter(h => h.count > 0)
      .map(h => new Date(h.date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 0) return { currentStreak: 0, maxStreak: 0 };

    let current = 1;
    let max = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diffTime = sortedDates[i].getTime() - sortedDates[i - 1].getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current++;
      } else if (diffDays > 1) {
        current = 1;
      }
      
      if (current > max) {
        max = current;
      }
    }

    const lastActiveDate = sortedDates[sortedDates.length - 1];
    const today = new Date();
    
    // Normalize to midnight for fair comparison
    const lastActiveMidnight = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffDaysFromToday = Math.round((todayMidnight.getTime() - lastActiveMidnight.getTime()) / (1000 * 60 * 60 * 24));
    
    let currentStreak = current;
    if (diffDaysFromToday > 1) {
      currentStreak = 0;
    }

    return { currentStreak, maxStreak: max };
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
  const githubUsername = integrations?.find(i => i.platform === 'github')?.username;

  if (summary.totalQuestions === 0 && (!integrations || integrations.length === 0)) {
    return (
      <div className="min-h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center animate-fade-in">
        <div className="glass max-w-lg w-full p-10 text-center rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-brand-primary/20">
              <Plus className="w-10 h-10 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-main mb-4 text-gradient">Welcome to AlgoForge!</h1>
            <p className="text-text-muted mb-8 leading-relaxed">
              You haven't added any topics or linked any platforms yet. Head over to the Sheet page to create your first topic and start tracking your DSA journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app/sheet" className="btn-primary w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary),0.5)] transition-all">
                Go to Sheet
              </Link>
              <Link to="/app/integrations" className="btn-secondary w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold">
                Link Platforms
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 space-y-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-main">Analytics Dashboard</h1>
          <Link to="/app/integrations" className="btn-secondary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Link Platform
          </Link>
        </div>
        
        <HeroStatsBar 
          aggregateStats={aggregateStats} 
          computedStreaks={computedStreaks} 
          githubUsername={githubUsername}
        />

        <ActivityHeatmap 
          heatmapRange={heatmapRange}
          heatmapYears={heatmapYears}
          handleRangeChange={handleRangeChange}
          combinedHeatmap={combinedHeatmap}
          startDate={startDate}
          endDate={endDate}
          daysDiff={daysDiff}
        />

        <PlatformCards integrations={integrations || []} />

        <Charts 
          velocityData={lineData} 
          difficultyData={difficultyData} 
          radarData={radarData} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[-32px]">
           <div className="hidden lg:block"></div> {/* Spacer for the grid layout since FocusPlan is in the second column */}
           <FocusPlan weakAreas={weakAreas} dailyPlan={dailyPlan} />
        </div>

      </div>
    </div>
  );
}
