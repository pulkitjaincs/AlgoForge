import { useState, useEffect } from 'react';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, BookOpen, GripVertical, Trash2, Plus, FolderOpen, Pencil } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { useQuestionStore } from '../../store/useQuestionStore';
import { AddQuestionModal } from '../ui/AddQuestionModal';
import { Modal } from '../ui/Modal';

const SortableQuestionItem = ({ question, topicId, subTopicId, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 100ms ease',
    zIndex: isDragging ? 40 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group/question">
      <div {...attributes} {...listeners} className="drag-handle opacity-0 group-hover/question:opacity-100">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1">
        <QuestionItem
          question={question}
          topicId={topicId}
          subTopicId={subTopicId}
          onEdit={() => onEdit(question)}
        />
      </div>
    </div>
  );
};

const SortableSubTopicSection = ({ subTopic, topicId, onAddQuestion, onEditSubTopic, onEditQuestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteSubTopic = useQuestionStore(state => state.deleteSubTopic);
  const reorderQuestions = useQuestionStore(state => state.reorderQuestions);
  const navigationTarget = useQuestionStore(state => state.navigationTarget);

  useEffect(() => {
    if (navigationTarget) {
      const isTargetChild = subTopic.questions.some(q => q._id === navigationTarget);
      if (isTargetChild || subTopic.id === navigationTarget) {
        setIsOpen(true);
      }
    }
  }, [navigationTarget, subTopic.id, subTopic.questions]);

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

  const handleQuestionDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = subTopic.questions.findIndex(q => q._id === active.id);
      const newIndex = subTopic.questions.findIndex(q => q._id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(topicId, subTopic.id, oldIndex, newIndex);
      }
    }
  };

  const solvedCount = subTopic.questions.filter(q => q.isSolved).length;
  const progress = (solvedCount / subTopic.questions.length) * 100 || 0;

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
              <p className="text-xs text-text-muted">{solvedCount} / {subTopic.questions.length} solved</p>
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
          <button onClick={() => deleteSubTopic(topicId, subTopic.id)} className="btn-danger" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 pt-0 border-t border-white/5 animate-fade-in">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
            <SortableContext items={subTopic.questions.map(q => q._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 mt-3">
                {subTopic.questions.map(q => (
                  <SortableQuestionItem
                    key={q._id}
                    question={q}
                    topicId={topicId}
                    subTopicId={subTopic.id}
                    onEdit={(question) => onEditQuestion(subTopic.id, question)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {subTopic.questions.length === 0 && (
            <p className="text-xs text-text-muted italic py-4 text-center">No questions yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export const TopicCard = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteTopic = useQuestionStore(state => state.deleteTopic);
  const addSubTopic = useQuestionStore(state => state.addSubTopic);
  const addQuestion = useQuestionStore(state => state.addQuestion);
  const editQuestion = useQuestionStore(state => state.editQuestion);
  const editSubTopic = useQuestionStore(state => state.editSubTopic);
  const editTopic = useQuestionStore(state => state.editTopic);
  const reorderSubTopics = useQuestionStore(state => state.reorderSubTopics);
  const reorderQuestions = useQuestionStore(state => state.reorderQuestions);
  const navigationTarget = useQuestionStore(state => state.navigationTarget);

  useEffect(() => {
    if (navigationTarget) {
      const isTargetChild = topic.questions?.some(q => q._id === navigationTarget) ||
        topic.subTopics?.some(st => st.id === navigationTarget || st.questions?.some(q => q._id === navigationTarget));
      if (isTargetChild || topic.id === navigationTarget) {
        setIsOpen(true);
      }
    }
  }, [navigationTarget, topic.id, topic.questions, topic.subTopics]);

  // Shared Modals State

  const [questionModal, setQuestionModal] = useState({ isOpen: false, subTopicId: null, mode: 'add', initialData: null });
  const [subTopicModal, setSubTopicModal] = useState({ isOpen: false, subTopic: null });
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

  const handleSubTopicDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = topic.subTopics.findIndex(st => st.id === active.id);
      const newIndex = topic.subTopics.findIndex(st => st.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSubTopics(topic.id, oldIndex, newIndex);
      }
    }
  };

  const handleQuestionDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = topic.questions.findIndex(q => q._id === active.id);
      const newIndex = topic.questions.findIndex(q => q._id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(topic.id, null, oldIndex, newIndex);
      }
    }
  };

  const handleQuestionSubmit = (data) => {
    if (questionModal.mode === 'add') {
      addQuestion(topic.id, questionModal.subTopicId, data);
    } else {
      editQuestion(topic.id, questionModal.subTopicId, questionModal.initialData._id, data);
    }
    setQuestionModal({ ...questionModal, isOpen: false });
  };

  const handleSubTopicSubmit = (e) => {
    e.preventDefault();
    editSubTopic(topic.id, subTopicModal.subTopic.id, subTopicModal.subTopic.title);
    setSubTopicModal({ ...subTopicModal, isOpen: false });
  };

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    editTopic(topic.id, topicModal.title, topicModal.description);
    setTopicModal({ ...topicModal, isOpen: false });
  };

  const totalQuestions = (topic.questions?.length || 0) +
    (topic.subTopics?.reduce((acc, st) => acc + (st.questions?.length || 0), 0) || 0);
  const solvedQuestions = (topic.questions?.filter(q => q.isSolved).length || 0) +
    (topic.subTopics?.reduce((acc, st) => acc + (st.questions?.filter(q => q.isSolved).length || 0), 0) || 0);
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
                {topic.subTopics?.length > 0 && ` • ${topic.subTopics.length} sub-topics`}
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
          <button onClick={() => addSubTopic(topic.id, "New Sub-Topic")} className="btn-icon" title="Add Sub-Topic">
            <FolderOpen className="w-4 h-4" />
          </button>
          <button onClick={() => setQuestionModal({ isOpen: true, subTopicId: null, mode: 'add', initialData: null })} className="btn-icon" title="Add Question">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setTopicModal({ ...topicModal, isOpen: true })} className="btn-icon" title="Edit Topic">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => deleteTopic(topic.id)} className="btn-danger" title="Delete Topic">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {topic.subTopics?.length > 0 && (
            <div className="space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubTopicDragEnd}>
                <SortableContext items={topic.subTopics.map(st => st.id)} strategy={verticalListSortingStrategy}>
                  {topic.subTopics.map(st => (
                    <SortableSubTopicSection
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

          {topic.questions?.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
                <SortableContext items={topic.questions.map(q => q._id)} strategy={verticalListSortingStrategy}>
                  {topic.questions.map(q => (
                    <SortableQuestionItem
                      key={q._id}
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
              onChange={(e) => setSubTopicModal({ ...subTopicModal, subTopic: { ...subTopicModal.subTopic, title: e.target.value } })}
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