import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical, Trash2, Plus, FolderOpen, Pencil } from 'lucide-react';
import { SortableQuestionItem } from './SortableQuestionItem';
import { useUIStore } from '../../../store/useUIStore';
import { SubTopic, Question } from '@algoforge/shared';
import { useDeleteSubTopic } from '../../../hooks/useSubTopics';
import { useReorderQuestions } from '../../../hooks/useQuestions';

interface SubTopicSectionProps {
  subTopic: SubTopic;
  topicId: string;
  onAddQuestion: (stId: string) => void;
  onEditSubTopic: (st: SubTopic) => void;
  onEditQuestion: (stId: string, q: Question) => void;
}

export const SubTopicSection = ({ subTopic, topicId, onAddQuestion, onEditSubTopic, onEditQuestion }: SubTopicSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteSubTopic = useDeleteSubTopic();
  const reorderQuestions = useReorderQuestions();
  const { navigationTarget } = useUIStore();

  const questions = useMemo(() => subTopic.questions || [], [subTopic.questions]);

  useEffect(() => {
    if (navigationTarget) {
      const isTargetChild = questions.some(q => q.id === navigationTarget);
      if (isTargetChild || subTopic.id === navigationTarget) {
        setIsOpen(true);
      }
    }
  }, [navigationTarget, subTopic.id, questions]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: subTopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 100ms ease',
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(oldIndex, 1);
        newQuestions.splice(newIndex, 0, removed);
        
        reorderQuestions.mutate({ topicId, subTopicId: subTopic.id, data: { questionIds: newQuestions.map(q => q.id || '') } });
      }
    }
  };

  const solvedCount = questions.filter(q => q.isSolved).length;
  const progress = questions.length > 0 ? (solvedCount / questions.length) * 100 : 0;

  return (
    <div ref={setNodeRef} style={style} id={subTopic.id} className="glass-subtle overflow-hidden group/subtopic">
      <div className="flex items-center">
        <div {...attributes} {...listeners} className="drag-handle opacity-0 group-hover/subtopic:opacity-100">
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between p-3 pl-1 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 bg-brand-secondary/10"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <FolderOpen className="w-4 h-4 text-brand-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-main">{subTopic.title}</h3>
              <p className="text-xs text-text-muted">{solvedCount} / {questions.length} solved</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 progress-bar hidden sm:block">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            {isOpen ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </div>
        </button>

        <div className="flex gap-1 pr-3 opacity-0 group-hover/subtopic:opacity-100 transition-opacity">
          <button onClick={() => onAddQuestion(subTopic.id)} className="btn-icon" title="Add Question">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => onEditSubTopic(subTopic)} className="btn-icon" title="Edit Sub-topic">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => deleteSubTopic.mutate({ topicId, subTopicId: subTopic.id })} className="btn-danger" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-white/5 animate-fade-in">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
            <SortableContext items={questions.map(q => (q.id || ''))} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 mt-3">
                {questions.map(q => (
                  <SortableQuestionItem
                    key={q.id}
                    question={q}
                    topicId={topicId}
                    subTopicId={subTopic.id}
                    onEdit={(question) => onEditQuestion(subTopic.id, question)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {questions.length === 0 && (
            <p className="text-xs text-text-muted italic py-4 text-center">No questions yet</p>
          )}
        </div>
      )}
    </div>
  );
};
