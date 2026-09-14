import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';

interface FocusPlanProps {
  weakAreas: any[];
  dailyPlan: {
    review: any[];
    weak: any[];
    random: any[];
  };
}

export function FocusPlan({ weakAreas, dailyPlan }: FocusPlanProps) {
  return (
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
  );
}
