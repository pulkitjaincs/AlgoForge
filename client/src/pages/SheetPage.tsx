import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useUIStore } from '../store/useUIStore';
import { TopicCard } from '../components/features/sheet/TopicCard';
import { Modal } from '../components/shared/Modal';

import { CommandPalette } from '../components/shared/CommandPalette';
import { Sparkles, RotateCcw, Plus, BookOpen, CheckCircle2, Target, Zap, RefreshCcw, Search } from 'lucide-react';
import { FilterBar } from '../components/features/sheet/FilterBar';
import { useTopics, useCreateTopic, useReorderTopics } from '../hooks/useTopics';
import { useResetProgress, useFullReset } from '../hooks/useQuestions';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';


export default function SheetPage() {
  const [searchParams] = useSearchParams();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  
  const { data: topics = [], isLoading, refetch } = useTopics(searchParams.toString());
  const createTopic = useCreateTopic();
  const reorderTopics = useReorderTopics();
  const resetProgress = useResetProgress();
  const fullReset = useFullReset();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  let totalNum = 0, solvedNum = 0;
  topics.forEach(topic => {
    topic.questions?.forEach(q => { totalNum++; if (q.isSolved) solvedNum++; });
    topic.subTopics?.forEach(st => {
      st.questions?.forEach(q => { totalNum++; if (q.isSolved) solvedNum++; });
    });
  });
  const stats = {
    total: totalNum,
    solved: solvedNum,
    progress: totalNum > 0 ? Math.round((solvedNum / totalNum) * 100) : 0
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    createTopic.mutate({ title: newTopicTitle, description: newTopicDescription }, {
      onSuccess: () => {
        setNewTopicTitle('');
        setNewTopicDescription('');
        setIsAddModalOpen(false);
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = topics.findIndex((t) => t.id === active.id);
      const newIndex = topics.findIndex((t) => t.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTopics = [...topics];
        const [removed] = newTopics.splice(oldIndex, 1);
        newTopics.splice(newIndex, 0, removed);
        
        reorderTopics.mutate({ orderedIds: newTopics.map(t => t.id) });
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12">
      <Helmet>
        <title>AlgoForge — DSA Sheet</title>
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <Sparkles className="w-6 h-6 text-brand-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient">
                  Your DSA Sheet
                </h1>
              </div>
              <p className="text-text-muted text-sm md:text-base">
                Track your DSA journey with the Striver SDE Sheet
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="p-2 glass-subtle text-text-muted hover:text-brand-primary transition-all hover:scale-110 active:scale-95 group relative"
                style={{ borderRadius: 'var(--radius-md)' }}
                title="Search (Ctrl + K)"
              >
                <Search className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[8px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">K</span>
              </button>
              <div className="h-6 w-px bg-border-dark hidden sm:block" />
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl glass-subtle text-text-muted hover:text-brand-primary transition-all hover:scale-110 active:scale-95"
                title="Sync from Database"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-border-dark hidden sm:block" />
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-subtle p-4 flex items-center gap-4">
              <div
                className="p-3 bg-brand-primary/10"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <BookOpen className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{topics.length}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Topics</p>
              </div>
            </div>
            <div className="glass-subtle p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-accent/10">
                <Target className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{stats.total}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Questions</p>
              </div>
            </div>
            <div className="glass-subtle p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{stats.solved}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Solved</p>
              </div>
            </div>
            <div className="glass-subtle p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-main">{stats.progress}%</p>
                <p className="text-xs text-text-muted uppercase tracking-wider">Progress</p>
              </div>
            </div>
          </div>
        </header>
        
        <FilterBar />

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-2 bg-white/5 rounded w-full mb-2"></div>
                <div className="h-2 bg-white/5 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {topics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!isLoading && topics.length === 0 && (
          <div className="glass text-center py-16 px-8 animate-fade-in">
            <div
              className="p-4 bg-brand-primary/10 w-fit mx-auto mb-4"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <BookOpen className="w-10 h-10 text-brand-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-main mb-2">No Topics Yet</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Start building your question sheet by adding your first topic.
            </p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-2" />
              Create Your First Topic
            </button>
          </div>
        )}

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Topic">
          <form onSubmit={handleAddTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Topic Title *</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Dynamic Programming"
                className="input-field"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
              <textarea
                placeholder="Briefly describe what this topic covers..."
                className="input-field min-h-[100px] resize-none"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-4">
              Create Topic
            </button>
          </form>
        </Modal>

        <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Sheet">
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <h4 className="font-semibold text-text-main mb-1">Option 1: Unmark All Progress</h4>
              <p className="text-sm text-text-muted mb-4">
                Keep all your topics and questions, but uncheck all "Solved" boxes.
              </p>
              <button
                onClick={() => {
                  resetProgress.mutate(undefined, {
                    onSuccess: () => setIsResetModalOpen(false)
                  });
                }}
                className="btn-secondary w-full"
              >
                Reset Progress Only
              </button>
            </div>

            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
              <h4 className="font-semibold text-text-main mb-1">Option 2: Restore Original Sheet</h4>
              <p className="text-sm text-text-muted mb-4">
                <span className="text-danger font-medium text-xs uppercase tracking-wider block mb-1">⚠️ Warning</span>
                Delete everything and restore the original Striver A2Z DSA Sheet from sheet.json.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("This will delete all custom topics and questions. Are you sure?")) {
                    window.alert("Please wait this might take a while!...");
                    fullReset.mutate(undefined, {
                      onSuccess: () => setIsResetModalOpen(false)
                    });
                  }
                }}
                className="btn-primary-danger w-full"
              >
                Restore Factory Settings
              </button>
            </div>
          </div>
        </Modal>
      </div>

        <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}