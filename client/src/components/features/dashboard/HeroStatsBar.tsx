import React from 'react';
import { Target, Zap, Activity, Github } from 'lucide-react';

interface HeroStatsBarProps {
  aggregateStats: {
    totalSolved: number;
    githubContributions: number;
  };
  computedStreaks: {
    currentStreak: number;
    maxStreak: number;
  };
  githubUsername?: string;
}

export function HeroStatsBar({ aggregateStats, computedStreaks, githubUsername }: HeroStatsBarProps) {
  const CardWrapper = githubUsername ? 'a' : 'div';
  const cardProps = githubUsername ? { href: `https://github.com/${githubUsername}`, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
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

      <CardWrapper {...(cardProps as any)} className={`glass p-4 rounded-xl flex items-center gap-4 border border-border-dark bg-gradient-to-br from-bg-elevated to-text-main/5 ${githubUsername ? 'hover:border-text-main/30 cursor-pointer transition-colors' : ''}`}>
        <div className="p-3 bg-text-main/10 rounded-xl border border-text-main/20"><Github className="text-text-main w-6 h-6" /></div>
        <div>
          <p className="text-2xl font-bold text-text-main">{aggregateStats.githubContributions}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
            {githubUsername ? `GitHub (@${githubUsername})` : 'GitHub Contributions'}
          </p>
        </div>
      </CardWrapper>
    </div>
  );
}
