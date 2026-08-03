import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, BookOpen, GripVertical, Trash2, Plus, FolderOpen, Pencil } from 'lucide-react';
import { SortableQuestionItem } from './SortableQuestionItem';
import { SubTopicSection } from './SubTopicSection';
import { useQuestionStore } from '../../../store/useQuestionStore';
import { AddQuestionModal } from '../../shared/AddQuestionModal';
import { Modal } from '../../shared/Modal';
import { Topic, SubTopic, Question } from '@algoforge/shared';
import { useDeleteTopic, useUpdateTopic, useReorderTopics } from '../../../hooks/useTopics';
import { useCreateSubTopic, useUpdateSubTopic, useReorderSubTopics } from '../../../hooks/useSubTopics';
import { useCreateQuestion, useUpdateQuestion, useReorderQuestions } from '../../../hooks/useQuestions';

interface TopicCardProps {
  topic: Topic;
}

export const TopicCard = ({ topic }: TopicCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigationTarget } = useQuestionStore();

  const deleteTopic = useDeleteTopic();
  const updateTopic = useUpdateTopic();
  const createSubTopic = useCreateSubTopic();
  const updateSubTopic = useUpdateSubTopic();
  const reorderSubTopics = useReorderSubTopics();
  
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const reorderQuestions = useReorderQuestions();

  const subTopics = useMemo(() => topic.subTopics || [], [topic.subTopics]);
  const questions = useMemo(() => topic.questions || [], [topic.questions]);

  useEffect(() => {
    if (navigationTarget) {
      const isTargetChild = questions.some(q => q.id === navigationTarget) ||
        subTopics.some(st => st.id === navigationTarget || st.questions?.some(q => q.id === navigationTarget));
      if (isTargetChild || topic.id === navigationTarget) {
        setIsOpen(true);
      }
    }
  }, [navigationTarget, topic.id, questions, subTopics]);

  // Shared Modals State
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    subTopicId: string | null;
    mode: 'add' | 'edit';
    initialData: any;
  }>({ isOpen: false, subTopicId: null, mode: 'add', initialData: null });

  const [subTopicModal, setSubTopicModal] = useState<{
    isOpen: boolean;
    subTopic: SubTopic | null;
  }>({ isOpen: false, subTopic: null });

  const [topicModal, setTopicModal] = useState({ isOpen: false, title: topic.title, description: topic.description || '' });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 100ms ease',
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.85 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSubTopicDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = subTopics.findIndex(st => st.id === active.id);
      const newIndex = subTopics.findIndex(st => st.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSubTopics = [...subTopics];
        const [removed] = newSubTopics.splice(oldIndex, 1);
        newSubTopics.splice(newIndex, 0, removed);
        
        reorderSubTopics.mutate({ topicId: topic.id, data: { subTopicIds: newSubTopics.map(st => st.id) } });
      }
    }
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(oldIndex, 1);
        newQuestions.splice(newIndex, 0, removed);
        
        reorderQuestions.mutate({ topicId: topic.id, subTopicId: null, data: { questionIds: newQuestions.map(q => q.id || '') } });
      }
    }
  };

  const handleQuestionSubmit = (data: Partial<Question>) => {
    if (questionModal.mode === 'add') {
      createQuestion.mutate({ topicId: topic.id, subTopicId: questionModal.subTopicId, data });
    } else {
      const qId = questionModal.initialData?.id || '';
      updateQuestion.mutate({ questionId: qId, data });
    }
    setQuestionModal({ ...questionModal, isOpen: false });
  };

  const handleSubTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subTopicModal.subTopic) {
      updateSubTopic.mutate({ subTopicId: subTopicModal.subTopic.id, data: { title: subTopicModal.subTopic.title } });
    }
    setSubTopicModal({ ...subTopicModal, isOpen: false });
  };

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTopic.mutate({ id: topic.id, data: { title: topicModal.title, description: topicModal.description } });
    setTopicModal({ ...topicModal, isOpen: false });
  };

  const totalQuestions = questions.length + subTopics.reduce((acc, st) => acc + (st.questions?.length || 0), 0);
  const solvedQuestions = questions.filter(q => q.isSolved).length +
    subTopics.reduce((acc, st) => acc + (st.questions?.filter(q => q.isSolved).length || 0), 0);
  const progress = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;

  return (
    <div ref={setNodeRef} style={style} id={topic.id} className="glass glass-hover group/topic animate-fade-in">
      <div className="flex items-center">
        <div {...attributes} {...listeners} className="drag-handle opacity-50 group-hover/topic:opacity-100 ml-2">
          <GripVertical className="w-5 h-5" />
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="flex-1 flex items-center justify-between p-4 pl-2 text-left">
          <div className="flex items-center gap-4">
            <div
              className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/10"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <BookOpen className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">{topic.title}</h2>
              <p className="text-sm text-text-muted">
                {solvedQuestions} / {totalQuestions} solved
                {subTopics.length > 0 && ` • ${subTopics.length} sub-topics`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-32 progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-medium text-text-muted w-12">{Math.round(progress)}%</span>
            </div>
            <div
              className={`p-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <ChevronDown className="w-5 h-5 text-text-muted" />
            </div>
          </div>
        </button>

        <div className="flex gap-1 pr-4 opacity-0 group-hover/topic:opacity-100 transition-opacity">
          <button onClick={() => createSubTopic.mutate({ topicId: topic.id, data: { title: "New Sub-Topic" } })} className="btn-icon" title="Add Sub-Topic">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setQuestionModal({ isOpen: true, subTopicId: null, mode: 'add', initialData: null })} className="btn-icon" title="Add Question">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setTopicModal({ ...topicModal, isOpen: true })} className="btn-icon" title="Edit Topic">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => deleteTopic.mutate(topic.id)} className="btn-danger" title="Delete Topic">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {subTopics.length > 0 && (
            <div className="space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubTopicDragEnd}>
                <SortableContext items={subTopics.map(st => st.id)} strategy={verticalListSortingStrategy}>
                  {subTopics.map(st => (
                    <SubTopicSection
                      key={st.id}
                      subTopic={st}
                      topicId={topic.id}
                      onAddQuestion={(stId) => setQuestionModal({ isOpen: true, subTopicId: stId, mode: 'add', initialData: null })}
                      onEditSubTopic={(stObj) => setSubTopicModal({ isOpen: true, subTopic: stObj })}
                      onEditQuestion={(stId, qObj) => setQuestionModal({ isOpen: true, subTopicId: stId, mode: 'edit', initialData: qObj })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
                <SortableContext items={questions.map(q => (q.id || ''))} strategy={verticalListSortingStrategy}>
                  {questions.map(q => (
                    <SortableQuestionItem
                      key={q.id}
                      question={q}
                      topicId={topic.id}
                      subTopicId={null}
                      onEdit={(qObj) => setQuestionModal({ isOpen: true, subTopicId: null, mode: 'edit', initialData: qObj })}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {/* Shared Question Modal */}
      <AddQuestionModal
        isOpen={questionModal.isOpen}
        onClose={() => setQuestionModal({ ...questionModal, isOpen: false })}
        mode={questionModal.mode}
        initialData={questionModal.initialData}
        onSubmit={handleQuestionSubmit}
      />

      {/* Shared Sub-topic Modal */}
      <Modal
        isOpen={subTopicModal.isOpen}
        onClose={() => setSubTopicModal({ ...subTopicModal, isOpen: false })}
        title="Edit Sub-topic"
      >
        <form onSubmit={handleSubTopicSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Sub-topic Title</label>
            <input
              autoFocus
              type="text"
              className="input-field"
              value={subTopicModal.subTopic?.title || ''}
              onChange={(e) => {
                if (subTopicModal.subTopic) {
                  setSubTopicModal({ ...subTopicModal, subTopic: { ...subTopicModal.subTopic, title: e.target.value } });
                }
              }}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-4">Save Changes</button>
        </form>
      </Modal>

      {/* Shared Topic Modal */}
      <Modal
        isOpen={topicModal.isOpen}
        onClose={() => setTopicModal({ ...topicModal, isOpen: false })}
        title="Edit Topic"
      >
        <form onSubmit={handleTopicSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Topic Title</label>
            <input
              autoFocus
              type="text"
              className="input-field"
              value={topicModal.title}
              onChange={(e) => setTopicModal({ ...topicModal, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              value={topicModal.description}
              onChange={(e) => setTopicModal({ ...topicModal, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-4">Save Changes</button>
        </form>
      </Modal>
    </div>
  );
};