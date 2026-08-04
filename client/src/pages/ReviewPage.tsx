import React, { useState, useCallback, useEffect } from 'react';
import { useReviewQueue, useReviewStats } from '../hooks/useReview';
import { questionsApi } from '../api/questions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Zap, Clock, ExternalLink } from 'lucide-react';
import { Timer } from '../components/shared/Timer';
import confetti from 'canvas-confetti';
import { Helmet } from 'react-helmet-async';
export default function ReviewPage() {
  const { data: queue, isLoading } = useReviewQueue();
  const { data: stats } = useReviewStats();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);

  const queryClient = useQueryClient();
  const addAttemptMutation = useMutation({
      mutationFn: ({ questionId, duration, confidence }: { questionId: string, duration?: number, confidence?: number }) => questionsApi.addAttempt(questionId, duration, confidence),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['review'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          queryClient.invalidateQueries({ queryKey: ['practice'] });
      }
  });

  const currentQuestion = queue?.[currentIndex];

  const submitAttempt = useCallback((confidenceScore: number) => {
      if (!currentQuestion || !queue) return;
      addAttemptMutation.mutate({ questionId: currentQuestion.id, duration: duration || undefined, confidence: confidenceScore });
      setShowConfidence(false);
      setDuration(null);
      
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex === queue.length - 1) {
          confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
          });
      }
  }, [currentQuestion, queue, duration, currentIndex, addAttemptMutation]);

  useEffect(() => {
    if (!showConfidence) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= 5) {
        submitAttempt(key);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfidence, submitAttempt]);

  const handleTimerStop = (durationSecs: number) => {
      setIsTimerActive(false);
      setDuration(durationSecs);
      setShowConfidence(true);
  };

  if (isLoading || !queue || !stats) {
    return <div className="p-8 text-center text-text-muted">Loading Review Queue...</div>;
  }

  if (queue.length === 0 || currentIndex >= queue.length) {
    return (
      <div className="min-h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center animate-fade-in">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-24 h-24 bg-success/20 rounded-full flex items-center justify-center">
            <Zap className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text-main">All Caught Up!</h1>
          <p className="text-text-muted">
            You have no more questions to review right now. Great job keeping up with your spaced repetition!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 animate-fade-in">
      <Helmet>
        <title>AlgoForge — Review</title>
      </Helmet>
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center pb-4 border-b border-border-dark">
            <div>
                <h1 className="text-2xl font-bold text-text-main">Spaced Repetition Review</h1>
                <p className="text-sm text-text-muted mt-1">{stats.dueToday} questions due today</p>
            </div>
            <div className="text-right">
                <span className="text-xl font-bold text-brand-primary">{currentIndex + 1} / {queue.length}</span>
                <p className="text-xs text-text-muted uppercase tracking-wider">Progress</p>
            </div>
        </header>

        <div className="glass p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${((currentIndex) / queue.length) * 100}%` }}></div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold text-text-main pr-8">{currentQuestion.title}</h2>
                    {currentQuestion.problemUrl && (
                        <a href={currentQuestion.problemUrl} target="_blank" rel="noreferrer" className="p-2 rounded bg-white/5 hover:bg-brand-primary/20 text-brand-primary transition-colors">
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    )}
                </div>
                
                <div className="flex gap-2 mb-8">
                    <span className="badge badge-medium text-xs">{currentQuestion.difficulty || 'Medium'}</span>
                    <span className="badge bg-white/5 text-xs">{currentQuestion.platform || 'LeetCode'}</span>
                    {currentQuestion.topic && <span className="badge bg-brand-accent/20 text-brand-accent border-brand-accent/30 text-xs">{currentQuestion.topic.title}</span>}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 py-8 border-t border-b border-border-dark my-8">
                
                {!showConfidence ? (
                    <>
                        <p className="text-text-muted text-center max-w-md">
                            Solve the problem on your preferred platform, then start the timer if you want to track your speed. When you're done, stop the timer to log your attempt.
                        </p>
                        
                        {!isTimerActive ? (
                            <button 
                                onClick={() => setIsTimerActive(true)}
                                className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
                            >
                                <Clock className="w-5 h-5" /> Start Timer
                            </button>
                        ) : (
                            <div className="scale-125 my-4">
                                <Timer isActive={isTimerActive} onStop={handleTimerStop} />
                            </div>
                        )}
                        
                        <button 
                            onClick={() => setShowConfidence(true)}
                            className="text-sm text-text-muted hover:text-text-main underline decoration-white/20 underline-offset-4 mt-4"
                        >
                            Skip timer & log result
                        </button>
                    </>
                ) : (
                    <div className="text-center space-y-6 animate-fade-in w-full">
                        <h3 className="text-xl font-medium text-text-main">How easy was this for you?</h3>
                        
                        <div className="flex justify-center gap-4 w-full px-4">
                            {[
                                { s: 1, l: 'Hard (Again)' },
                                { s: 2, l: 'Challenging' },
                                { s: 3, l: 'Good' },
                                { s: 4, l: 'Easy' },
                                { s: 5, l: 'Too Easy' }
                            ].map(({s, l}) => (
                                <button 
                                    key={s}
                                    onClick={() => submitAttempt(s)}
                                    className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/10 transition-all group"
                                >
                                    <span className="text-2xl font-bold text-text-main mb-1 group-hover:text-brand-primary">{s}</span>
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider">{l}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>

      </div>
    </div>
  );
}
