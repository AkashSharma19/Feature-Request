import { useNavigate, useParams } from 'react-router-dom';
import { ChevronUp, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusBadge, ProgressBar } from '../ui';
import { useStore } from '../../store/useStore';
import { formatDate, cn } from '../../lib/utils';

export default function RoadmapCard({ item, feature, isOverlay, isAdmin }) {
  const navigate = useNavigate();
  const { orgId: urlOrgId } = useParams();
  const { toggleVote, votes } = useStore();
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: item.id, disabled: !isAdmin || isOverlay });


  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.4 : 1,
  };

  if (!feature) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-all group',
        isDragging && !isOverlay && 'shadow-xl border-gray-900 opacity-50'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical size={14} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-gray-900 transition-colors"
            onClick={() => navigate(isAdmin ? `/admin/requests/${feature.id}` : `/b/${urlOrgId}/requests/${feature.id}`)}
          >
            {feature.title}
          </p>


          {/* Progress */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Progress</span>
              <span>{feature.progress}%</span>
            </div>
            <ProgressBar value={feature.progress} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            {isAdmin && feature.dueDate && (
              <span className="text-[10px] text-gray-400">ETA: {formatDate(feature.dueDate)}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); toggleVote(feature.id); }}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ml-auto',
                votes[feature.id]
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
              )}
            >
              <ChevronUp size={10} /> {feature.votes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
