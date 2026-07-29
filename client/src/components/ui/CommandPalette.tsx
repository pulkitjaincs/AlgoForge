import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Hash, FolderOpen, BookOpen, CornerDownLeft } from 'lucide-react';
import { useQuestionStore } from '../../store/useQuestionStore';

export const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const topics = useQuestionStore(state => state.topics);
    const setNavigationTarget = useQuestionStore(state => state.setNavigationTarget);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    // Flatten data for searching
    const flattenedItems = [];
    topics.forEach(topic => {
        flattenedItems.push({ type: 'topic', id: topic.id, title: topic.title, subtitle: 'Topic' });

        topic.subTopics?.forEach(st => {
            flattenedItems.push({ type: 'subtopic', id: st.id, title: st.title, subtitle: `Sub-topic in ${topic.title}` });

            st.questions?.forEach(q => {
                flattenedItems.push({
                    type: 'question',
                    id: q._id,
                    title: q.title,
                    subtitle: `In ${st.title}`,
                    isSolved: q.isSolved
                });
            });
        });

        topic.questions?.forEach(q => {
            flattenedItems.push({
                type: 'question',
                id: q._id,
                title: q.title,
                subtitle: `In ${topic.title}`,
                isSolved: q.isSolved
            });
        });
    });

    const filteredItems = query.trim() === ''
        ? []
        : flattenedItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 7);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.max(filteredItems.length, 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
            } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex]);

    const handleSelect = (item) => {
        setNavigationTarget(item.id);

        setTimeout(() => {
            const element = document.getElementById(item.id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('animate-glow');
                setTimeout(() => {
                    element.classList.remove('animate-glow');
                    setNavigationTarget(null);
                }, 2000);
            }
        }, 100);

        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]">
            <div
                className="absolute inset-0 bg-black/80 animate-fade-in"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-xl mx-4 bg-bg-elevated border border-border-dark overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] animate-scale-in"
                style={{ borderRadius: 'var(--radius-lg)' }}
            >
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-border-dark">
                    <Search className="w-4 h-4 text-text-muted mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-base text-text-main placeholder:text-text-muted font-medium"
                        placeholder="Search problems..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <kbd className="min-w-[28px] h-5 flex items-center justify-center bg-text-main/5 border border-border-dark rounded text-[9px] text-text-muted font-mono shadow-sm">ESC</kbd>
                </div>

                <div className="max-h-[50vh] overflow-y-auto px-2 pb-2">
                    {filteredItems.length > 0 ? (
                        <div className="space-y-0.5 mt-2">
                            {filteredItems.map((item, idx) => (
                                <button
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 transition-all ${idx === selectedIndex ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-text-main/5'
                                        }`}
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`${idx === selectedIndex ? 'text-white' : 'text-text-muted'}`}>
                                            {item.type === 'topic' ? <BookOpen className="w-3.5 h-3.5" /> :
                                                item.type === 'subtopic' ? <FolderOpen className="w-3.5 h-3.5" /> :
                                                    <Hash className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="flex flex-col text-left overflow-hidden">
                                            <span className={`text-sm font-semibold truncate ${idx === selectedIndex ? 'text-white' : (item.isSolved ? 'text-text-muted' : 'text-text-main')}`}>
                                                {item.title}
                                            </span>
                                            <span className={`text-[9px] uppercase tracking-widest font-bold ${idx === selectedIndex ? 'text-white/70' : 'text-text-muted'}`}>
                                                {item.subtitle}
                                            </span>
                                        </div>
                                    </div>
                                    {idx === selectedIndex && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase animate-fade-in">
                                            <span>Enter</span>
                                            <CornerDownLeft className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : query.trim() !== '' ? (
                        <div className="py-10 text-center text-text-muted">
                            <p className="text-sm font-medium">No results found.</p>
                        </div>
                    ) : (
                        <div className="py-8 px-4 border-b border-border-dark">
                            <div className="grid grid-cols-3 gap-2">
                                <div
                                    className="bg-text-main/5 border border-border-dark p-3 flex flex-col items-center gap-2 group hover:bg-text-main/10 transition-colors"
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                >
                                    <BookOpen className="w-4 h-4 text-brand-primary" />
                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Topics</span>
                                </div>
                                <div
                                    className="bg-text-main/5 border border-border-dark p-3 flex flex-col items-center gap-2 group hover:bg-text-main/10 transition-colors"
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                >
                                    <FolderOpen className="w-4 h-4 text-brand-secondary" />
                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Sheets</span>
                                </div>
                                <div
                                    className="bg-text-main/5 border border-border-dark p-3 flex flex-col items-center gap-2 group hover:bg-text-main/10 transition-colors"
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                >
                                    <Hash className="w-4 h-4 text-brand-accent" />
                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Problems</span>
                                </div>
                            </div>
                            <p className="mt-6 text-center text-xs text-text-muted font-medium">Start typing to search across 450+ questions...</p>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 bg-text-main/[0.02] border-t border-border-dark flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <kbd className="min-w-[20px] h-5 flex items-center justify-center bg-text-main/5 border border-border-dark rounded text-[10px] text-text-muted font-mono shadow-sm">↑↓</kbd>
                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Navigate</span>
                    </div>
                    <div className="w-px h-3 bg-border-dark" />
                    <div className="flex items-center gap-2">
                        <kbd className="min-w-[34px] h-5 flex items-center justify-center bg-text-main/5 border border-border-dark rounded text-[9px] text-text-muted font-mono shadow-sm">↵</kbd>
                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Select</span>
                    </div>
                    <div className="w-px h-3 bg-border-dark" />
                    <div className="flex items-center gap-2">
                        <kbd className="min-w-[28px] h-5 flex items-center justify-center bg-text-main/5 border border-border-dark rounded text-[9px] text-text-muted font-mono shadow-sm">ESC</kbd>
                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Close</span>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};
