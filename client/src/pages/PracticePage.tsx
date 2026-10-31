import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../api/questions';
import { useDailyPlan } from '../hooks/usePractice';
import { SocraticHintDrawer } from '../components/features/ai/SocraticHintDrawer';
import { ExternalLink, CheckCircle2, ArrowLeft, ArrowRight, Zap, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Helmet } from 'react-helmet-async';

export default function PracticePage() {
  const { questionId } = useParams<{ questionId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: dailyPlan, isLoading: isPlanLoading } = useDailyPlan();

  // Combine daily plan queue
  const queue = [
    ...(dailyPlan?.review || []),
    ...(dailyPlan?.weak || []),
    ...(dailyPlan?.random || []),
  ];

  // Resolve active question ID
  const activeId = questionId || queue[0]?.id;

  const { data: question, isLoading: isQuestionLoading } = useQuery({
    queryKey: ['question', activeId],
    queryFn: () => questionsApi.getById(activeId!),
    enabled: !!activeId,
  });

  const [notes, setNotes] = useState('');
  const [showConfidence, setShowConfidence] = useState(false);

  useEffect(() => {
    if (question?.notes) {
      setNotes(question.notes);
    } else {
      setNotes('');
    }
    setShowConfidence(false);
  }, [question?.id, question?.notes]);

  const updateNotesMutation = useMutation({
    mutationFn: (newNotes: string) => questionsApi.updateNotes(activeId!, newNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', activeId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const addAttemptMutation = useMutation({
    mutationFn: (confidence: number) => questionsApi.addAttempt(activeId!, confidence),
    onSuccess: () => {
      setShowConfidence(false);
      queryClient.invalidateQueries({ queryKey: ['practice'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['question', activeId] });
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });

      // Navigate to next in queue
      const currentIndex = queue.findIndex((q) => q.id === activeId);
      if (currentIndex !== -1 && currentIndex + 1 < queue.length) {
        navigate(`/app/practice/${queue[currentIndex + 1].id}`);
      } else {
        navigate('/app/practice');
      }
    },
  });

  if (isPlanLoading || (activeId && isQuestionLoading)) {
    return (
      <div className="h-[75vh] w-full flex flex-col items-center justify-center space-y-4 text-text-muted">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        <p className="font-medium text-sm">Loading Practice Session...</p>
      </div>
    );
  }

  if (!activeId || !question) {
    return (
      <div className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center animate-fade-in text-center">
        <div className="glass max-w-md p-8 rounded-2xl border border-border-dark space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text-main">Practice Queue Clear!</h2>
          <p className="text-xs text-text-muted">
            You've completed all scheduled questions in your practice queue for today.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/app/dashboard" className="btn-secondary text-xs px-5 py-2.5 rounded-xl">
              Back to Dashboard
            </Link>
            <Link to="/app/sheet" className="btn-primary text-xs px-5 py-2.5 rounded-xl">
              Browse Sheet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = queue.findIndex((q) => q.id === activeId);
  const prevQuestion = currentIndex > 0 ? queue[currentIndex - 1] : null;
  const nextQuestion = currentIndex !== -1 && currentIndex + 1 < queue.length ? queue[currentIndex + 1] : null;

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Helmet>
        <title>AlgoForge — Practice: {question.title}</title>
      </Helmet>

      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border-dark/60 pb-4">
        <Link
          to="/app/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {queue.length > 0 && currentIndex !== -1 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>
              Queue Item <strong className="text-brand-primary">{currentIndex + 1}</strong> of {queue.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Problem Card */}
      <div className="glass p-6 md:p-8 rounded-2xl border border-border-dark space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`badge ${question.difficulty === 'Easy' ? 'badge-easy' : question.difficulty === 'Hard' ? 'badge-hard' : 'badge-medium'} text-xs font-semibold`}>
                {question.difficulty || 'Medium'}
              </span>
              <span className="badge bg-white/5 border border-white/10 text-xs font-semibold uppercase">
                {question.platform || 'LeetCode'}
              </span>
              {question.isSolved && (
                <span className="badge bg-success/20 text-success border border-success/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-main">{question.title}</h1>
          </div>

          {question.problemUrl && (
            <a
              href={question.problemUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
            >
              Open on {question.platform ? question.platform.toUpperCase() : 'Platform'}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Embedded Socratic AI Copilot Drawer */}
        <SocraticHintDrawer key={question.id} questionId={question.id} questionTitle={question.title} />

        {/* Notes & Solution Scratchpad */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Problem Notes & Key Takeaways
            </label>
            <button
              onClick={() => updateNotesMutation.mutate(notes)}
              disabled={updateNotesMutation.isPending}
              className="text-xs text-brand-primary hover:underline font-semibold"
            >
              {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Record time complexity, edge cases, and why you used this approach..."
            className="w-full text-xs p-3.5 rounded-xl bg-bg-dark border border-border-dark text-text-main placeholder-text-muted focus:outline-none focus:border-brand-primary font-mono leading-relaxed"
          />
        </div>

        {/* Completion & Spaced Repetition Rating */}
        <div className="pt-4 border-t border-border-dark/60">
          {!showConfidence ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-muted">
                Solved this problem? Log your result to schedule spaced repetition review.
              </p>
              <button
                onClick={() => setShowConfidence(true)}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Log Solution & Rate Recall
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in text-center">
              <h3 className="text-sm font-semibold text-text-main">
                How easy was it to recall and solve?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-xl mx-auto">
                {[
                  { score: 1, label: 'Hard (Again)' },
                  { score: 2, label: 'Challenging' },
                  { score: 3, label: 'Good' },
                  { score: 4, label: 'Easy' },
                  { score: 5, label: 'Trivial' },
                ].map(({ score, label }) => (
                  <button
                    key={score}
                    onClick={() => addAttemptMutation.mutate(score)}
                    disabled={addAttemptMutation.isPending}
                    className="p-3 rounded-xl border border-border-dark bg-bg-dark hover:border-brand-primary hover:bg-brand-primary/10 transition-all flex flex-col items-center justify-center group"
                  >
                    <span className="text-lg font-bold text-text-main group-hover:text-brand-primary">
                      {score}
                    </span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer between queue items */}
      <div className="flex items-center justify-between gap-4">
        {prevQuestion ? (
          <Link
            to={`/app/practice/${prevQuestion.id}`}
            className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous: {prevQuestion.title.slice(0, 20)}...
          </Link>
        ) : (
          <div />
        )}

        {nextQuestion ? (
          <Link
            to={`/app/practice/${nextQuestion.id}`}
            className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-2"
          >
            Next: {nextQuestion.title.slice(0, 20)}...
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
