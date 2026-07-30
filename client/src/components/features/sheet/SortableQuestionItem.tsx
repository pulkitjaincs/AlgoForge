import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { Question } from '../../../types';

interface SortableQuestionItemProps {
  question: Question;
  topicId: string;
  subTopicId: string | null;
  onEdit: (q: Question) => void;
}

export const SortableQuestionItem = ({ question, topicId, subTopicId, onEdit }: SortableQuestionItemProps) => {
  const itemId = question.id || '';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: itemId });

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
