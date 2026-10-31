import { useState } from 'react';
import { useSocraticHint } from '../../../hooks/useAI';
import { Sparkles, HelpCircle, AlertTriangle, ShieldCheck, Send, Loader2 } from 'lucide-react';

interface SocraticHintDrawerProps {
  questionId: string;
  questionTitle: string;
}

export function SocraticHintDrawer({ questionId, questionTitle }: SocraticHintDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [userCode, setUserCode] = useState('');
  const [approach, setApproach] = useState('');
  
  const hintMutation = useSocraticHint();

  const handleFetchHint = (level: 1 | 2 | 3) => {
    setSelectedLevel(level);
    hintMutation.mutate({
      questionId,
      hintLevel: level,
      userCode: userCode.trim() || undefined,
      currentApproach: approach.trim() || undefined,
    });
  };

  return (
    <div className="border border-border-dark bg-bg-elevated rounded-2xl overflow-hidden shadow-lg transition-all">
      <div
        className="p-4 bg-gradient-to-r from-brand-primary/10 via-transparent to-transparent flex items-center justify-between cursor-pointer border-b border-border-dark/60 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-main">Socratic AI Problem Copilot</h4>
            <p className="text-xs text-text-muted">Tiered hints without spoiling full solutions</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-brand-primary px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
          {isOpen ? 'Close Copilot' : 'Open Copilot'}
        </span>
      </div>

      {isOpen && (
        <div className="p-5 space-y-5 animate-fade-in">
          {/* Level selector buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { level: 1 as const, name: '1. Concept & Invariant', icon: HelpCircle },
              { level: 2 as const, name: '2. Big-O & Edge Cases', icon: AlertTriangle },
              { level: 3 as const, name: '3. Breaking Test Case', icon: ShieldCheck },
            ].map(({ level, name, icon: Icon }) => (
              <button
                key={level}
                onClick={() => handleFetchHint(level)}
                disabled={hintMutation.isPending}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLevel === level && hintMutation.data
                    ? 'border-brand-primary bg-brand-primary/15 text-brand-primary shadow-sm'
                    : 'border-border-dark bg-bg-dark text-text-muted hover:text-text-main hover:border-brand-primary/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>

          {/* Optional approach / code inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted">
                Your Approach / Stuck Point (Optional)
              </label>
              <span className="text-[10px] text-text-muted">Helps tailor the feedback</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Trying to use two pointers but duplicate elements cause infinite loop..."
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-bg-dark border border-border-dark text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleFetchHint(selectedLevel)}
              disabled={hintMutation.isPending}
              className="btn-primary text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
            >
              {hintMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reasoning Socratic Hint...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Generate Level {selectedLevel} Hint
                </>
              )}
            </button>
          </div>

          {/* Hint Response Area */}
          {hintMutation.data && (
            <div className="p-4 rounded-xl bg-bg-dark border border-brand-primary/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  Level {hintMutation.data.hintLevel}: {hintMutation.data.levelName.replace(/_/g, ' ')}
                </span>
                {hintMutation.data.complexityTarget && (
                  <span className="text-xs font-mono font-semibold text-text-muted">
                    Target: {hintMutation.data.complexityTarget}
                  </span>
                )}
              </div>

              <p className="text-sm text-text-main leading-relaxed">
                {hintMutation.data.guidance}
              </p>

              {hintMutation.data.counterExample && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warning">
                    Counter Example / Breaking Input:
                  </span>
                  <div className="text-xs font-mono text-text-main break-all">
                    {hintMutation.data.counterExample}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20 flex items-start gap-2">
                <span className="text-sm">🤔</span>
                <p className="text-xs font-medium text-brand-primary">
                  {hintMutation.data.thoughtPrompt}
                </p>
              </div>
            </div>
          )}

          {hintMutation.isError && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
              Failed to generate hint. Please try again or check network connection.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
