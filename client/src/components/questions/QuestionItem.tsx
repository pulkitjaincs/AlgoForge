import { useState } from 'react';
import { ExternalLink, Check, Trash2, Pencil, Star, StickyNote, Building2 } from 'lucide-react';
import { useQuestionStore } from '../../store/useQuestionStore';

export const QuestionItem = ({ question, topicId, subTopicId, onEdit }) => {
    const toggleSolved = useQuestionStore(state => state.toggleSolved);
    const toggleStarred = useQuestionStore(state => state.toggleStarred);
    const updateNotes = useQuestionStore(state => state.updateNotes);
    const deleteQuestion = useQuestionStore(state => state.deleteQuestion);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [noteText, setNoteText] = useState(question.notes || '');

    const difficultyClass = {
        'Basic': 'badge-easy bg-brand-accent/15 text-brand-accent border-brand-accent/20',
        'Easy': 'badge-easy',
        'Medium': 'badge-medium',
        'Hard': 'badge-hard'
    }[question.questionId?.difficulty] || 'badge-medium';

    const companies = question.questionId?.companyTags || [];

    const handleNotesToggle = () => {
        if (isNotesOpen) {
            updateNotes(topicId, subTopicId, question._id, noteText);
        }
        setIsNotesOpen(!isNotesOpen);
    };

    return (
        <div id={question._id} className="glass-subtle p-3 hover:border-brand-primary/30 transition-all duration-300 group/item">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleSolved(topicId, subTopicId, question._id)}
                        className={`checkbox-solved ${question.isSolved ? 'checked' : ''}`}
                    >
                        {question.isSolved && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <button
                        onClick={() => toggleStarred(topicId, subTopicId, question._id)}
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
                                {question.questionId?.platform}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`badge ${difficultyClass} hidden sm:inline-flex`}>
                        {question.questionId?.difficulty}
                    </span>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/item:opacity-100 transition-all">
                        {question.questionId?.problemUrl && (
                            <a
                                href={question.questionId.problemUrl}
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
                            onClick={() => deleteQuestion(topicId, subTopicId, question._id)}
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
                        onBlur={() => updateNotes(topicId, subTopicId, question._id, noteText)}
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
        </div>
    );
};
