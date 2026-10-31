import React, { useState, useEffect } from 'react';
import { useAICoachPlan, useRefreshAICoachPlan } from '../../../hooks/useAI';
import { Sparkles, Trophy, Target, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AICoachCard() {
  const { data: coach, isLoading } = useAICoachPlan();
  const refreshMutation = useRefreshAICoachPlan();
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    const updateCooldown = () => {
      const last = Number(localStorage.getItem('ai_coach_last_refresh') || 0);
      const elapsed = Math.floor((Date.now() - last) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      setCooldownSeconds(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [refreshMutation.isSuccess]);

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-2xl border border-brand-primary/20 animate-pulse flex flex-col justify-between min-h-[220px]">
        <div className="space-y-3">
          <div className="h-5 w-40 bg-brand-primary/20 rounded"></div>
          <div className="h-4 w-3/4 bg-white/10 rounded"></div>
          <div className="h-4 w-1/2 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (!coach) return null;

  const isCooldownActive = cooldownSeconds > 0;
  const cooldownMinutes = Math.ceil(cooldownSeconds / 60);

  return (
    <div className="glass p-6 md:p-8 rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-bg-elevated to-brand-accent/5 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-brand-primary" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-dark/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/20 border border-brand-primary/30 text-brand-primary shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">AI Study Coach</span>
                {coach.contestAlert && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger/20 text-danger border border-danger/30 animate-pulse">
                    Contest in {coach.contestAlert.hoursUntil}h
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-text-main mt-0.5">{coach.headline}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-bg-dark border border-border-dark text-text-muted">
              <Clock className="w-3.5 h-3.5 text-brand-primary" />
              <span>{coach.targetMinutes}m target</span>
            </div>
            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending || isCooldownActive}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isCooldownActive
                  ? 'bg-bg-dark/80 text-text-muted/60 border border-border-dark cursor-not-allowed'
                  : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20'
              }`}
              title={isCooldownActive ? `Manual refresh locked for ${cooldownMinutes}m` : 'Generate fresh AI Coach plan'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{refreshMutation.isPending ? 'Refreshing...' : isCooldownActive ? `Locked (${cooldownMinutes}m)` : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
          {coach.analysis}
        </p>

        {coach.contestAlert && (
          <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <Trophy className="w-4 h-4 text-warning shrink-0" />
              <div className="text-xs text-text-main truncate">
                <span className="font-semibold text-warning">{coach.contestAlert.platform.toUpperCase()}:</span>{' '}
                {coach.contestAlert.title}
              </div>
            </div>
            <Link
              to="/app/contests"
              className="text-xs font-medium text-warning hover:underline shrink-0"
            >
              View Calendar →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Tactical Recommendations
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coach.recommendations.map((rec: any, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-bg-dark/70 border border-border-dark/60 hover:border-brand-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-text-main truncate">{rec.title}</span>
                    {rec.difficulty && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                        {rec.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-border-dark/50">
          <span className="text-xs text-text-muted italic">💡 {coach.motivationalTip}</span>
          <Link
            to="/app/practice"
            className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 shadow-lg shadow-brand-primary/20"
          >
            Launch Practice Session
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
