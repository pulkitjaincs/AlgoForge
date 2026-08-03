import { useState } from 'react';
import { ExternalLink, Check, Trash2, Pencil, Star, StickyNote, Building2 } from 'lucide-react';
import { useUpdateQuestion, useDeleteQuestion } from '../../../hooks/useQuestions';
import { Timer } from '../../shared/Timer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '../../../api/questions';

interface QuestionItemProps {
    question: any;
    topicId: string;
    subTopicId: string | null;
    onEdit: () => void;
}

import React from 'react';

export const QuestionItem = React.memo(({ question, topicId, subTopicId, onEdit }: QuestionItemProps) => {
    const updateQuestion = useUpdateQuestion();
    const deleteQuestion = useDeleteQuestion();
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteText, setNoteText] = useState(question.notes || '');
    
    const queryClient = useQueryClient();
    const addAttemptMutation = useMutation({
        mutationFn: ({ duration, confidence }: { duration?: number, confidence?: number }) => questionsApi.addAttempt(question.id, duration, confidence),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['practice'] });
            queryClient.invalidateQueries({ queryKey: ['review'] });
        }
    });

    const [isTimerActive, setIsTimerActive] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [showConfidence, setShowConfidence] = useState(false);

    const handleTimerStop = (durationSecs: number) => {
        setIsTimerActive(false);
        setDuration(durationSecs);
    };

    const handleSolveToggle = () => {
        if (!question.isSolved) {
            setShowConfidence(true);
        } else {
            updateQuestion.mutate({ questionId: question.id, data: { isSolved: false } });
        }
    };

    const submitAttempt = (confidenceScore: number) => {
        addAttemptMutation.mutate({ duration: duration || undefined, confidence: confidenceScore });
        setShowConfidence(false);
        setDuration(null);
    };

    const qId = question.id || '';
    const qObj = question.questionId || question;

    const difficultyMap: Record<string, string> = {
        'Basic': 'badge-easy bg-brand-accent/15 text-brand-accent border-brand-accent/20',
        'Easy': 'badge-easy',
        'Medium': 'badge-medium',
        'Hard': 'badge-hard'
    };
    const difficultyClass = difficultyMap[qObj.difficulty] || 'badge-medium';

    const companies: string[] = qObj.companyTags || [];

    const handleNotesToggle = () => {
        if (isNotesOpen) {
            updateQuestion.mutate({ questionId: qId, data: { notes: noteText } });
        }
        setIsNotesOpen(!isNotesOpen);
    };

    return (
        <div id={qId} className="glass-subtle p-3 hover:border-brand-primary/30 transition-all duration-300 group/item">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSolveToggle}
                        className={`checkbox-solved flex-shrink-0 ${question.isSolved ? 'checked' : ''}`}
                    >
                        {question.isSolved && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <button
                        onClick={() => updateQuestion.mutate({ questionId: qId, data: { isStarred: !question.isStarred } })}
                        className={`transition-colors duration-200 ${question.isStarred ? 'text-warning' : 'text-text-muted hover:text-warning'}`}
                    >
                        <Star className={`w-4 h-4 ${question.isStarred ? 'fill-current' : ''}`} />
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium transition-all ${question.isSolved ? 'text-text-muted line-through opacity-60' : 'text-text-main'}`}>
                                {question.title}
                            </span>
                            <span
                                className="text-[10px] uppercase tracking-wider text-text-muted font-bold px-1.5 py-0.5 border border-white/5"
                                style={{ borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                            >
                                {qObj.platform || 'leetcode'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`badge ${difficultyClass} hidden sm:inline-flex`}>
                        {qObj.difficulty || 'Medium'}
                    </span>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-all">
                        {qObj.problemUrl && (
                            <a
                                href={qObj.problemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-icon text-brand-primary"
                                title="Open Problem"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                        <button
                            onClick={handleNotesToggle}
                            className={`btn-icon ${isNotesOpen ? 'text-brand-primary bg-brand-primary/10' : ''}`}
                            title="Notes"
                        >
                            <StickyNote className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onEdit}
                            className="btn-icon"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsTimerActive(!isTimerActive)}
                            className={`btn-icon ${isTimerActive ? 'text-brand-accent bg-brand-accent/10' : ''}`}
                            title="Timer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </button>
                        <button
                            onClick={() => deleteQuestion.mutate({ topicId, subTopicId, questionId: qId })}
                            className="btn-danger"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isNotesOpen && (
                <div className="mt-3 pt-3 border-t border-white/5 animate-fade-in">
                    <textarea
                        autoFocus
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your private notes here..."
                        className="input-field min-h-[80px] text-sm py-2"
                        onBlur={() => updateQuestion.mutate({ questionId: qId, data: { notes: noteText } })}
                    />
                    <div className="flex justify-end mt-1">
                        <span className="text-[10px] text-text-muted">Auto-saves on blur</span>
                    </div>
                </div>
            )}

            {companies.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 ml-8 flex-wrap">
                    <Building2 className="w-3 h-3 text-text-muted" />
                    {companies.slice(0, 5).map((company, idx) => (
                        <span
                            key={idx}
                            className="text-[10px] text-text-muted px-1.5 py-0.5 bg-white/[0.02] border border-white/5"
                            style={{ borderRadius: 'var(--radius-sm)' }}
                        >
                            {company}
                        </span>
                    ))}
                    {companies.length > 5 && (
                        <span className="text-[10px] text-text-muted">+{companies.length - 5} more</span>
                    )}
                </div>
            )}
            
            <div className="mt-2 ml-8 flex items-center justify-between">
              <Timer isActive={isTimerActive} onStop={handleTimerStop} />
              
              {showConfidence && (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg ml-auto">
                    <span className="text-sm font-medium text-text-main">Rate confidence:</span>
                    {[1,2,3,4,5].map(score => (
                        <button 
                            key={score}
                            onClick={() => submitAttempt(score)}
                            className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 hover:bg-brand-primary hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
                        >
                            {score}
                        </button>
                    ))}
                    <button onClick={() => setShowConfidence(false)} className="ml-2 text-xs text-text-muted hover:text-text-main">Cancel</button>
                </div>
              )}
            </div>
        </div>
    );
});
