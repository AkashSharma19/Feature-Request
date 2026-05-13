import { useNavigate, useParams } from 'react-router-dom';
import { ChevronUp, Pin, Flame } from 'lucide-react';
import { StatusBadge, ProgressBar, Card } from '../ui';
import { useStore } from '../../store/useStore';
import { formatDate, cn } from '../../lib/utils';
import { useAdmin } from '../../lib/useAdmin';

export default function RequestCard({ request, rank }) {
  const { toggleVote, votes } = useStore();
  const navigate = useNavigate();
  const isTrending = rank <= 3;
  const { orgId } = useParams();
  const isAdmin = useAdmin();

  return (
    <Card
      className={cn(
        "p-4 feature-card cursor-pointer relative overflow-hidden animate-fade-in",
        request.actionNeeded ? "ring-2 ring-gray-900 border-gray-900 bg-gray-50/10" : ""
      )}
      onClick={() => {
        if (isAdmin) {
          navigate(`/admin/requests/${request.id}`);
        } else if (orgId) {
          navigate(`/b/${orgId}/requests/${request.id}`);
        }
      }}
    >
      {/* Trending ribbon */}
      {isTrending && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
            <Flame size={9} /> Trending
          </span>
        </div>
      )}

      {/* Pin indicator */}
      {request.pinned && (
        <Pin size={12} className="absolute top-3 left-3 text-gray-900" />
      )}

      {/* Header */}
      <div className="mb-3 pr-16">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-teal-700 transition-colors">
          {request.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{request.description}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {request.actionNeeded && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-900 text-white border-gray-900">
            Action Needed
          </span>
        )}
        {isAdmin && (() => {
           const today = new Date();
           today.setHours(0, 0, 0, 0);
           const isOverdue = request.deadline && new Date(request.deadline) < today && !['Closed', 'Tested', 'Cancelled'].includes(request.status);
           return isOverdue ? (
             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-100 text-red-600 border-red-200 uppercase">
               Overdue
             </span>
           ) : null;
        })()}
        <StatusBadge status={request.status} />
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200">
          {request.category}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{request.progress}%</span>
        </div>
        <ProgressBar value={request.progress} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{request.owner || 'Unassigned'}</p>
          <p className="text-[10px] text-gray-400">{formatDate(request.dueDate)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleVote(request.id); }}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
            votes[request.id]
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          )}
        >
          <ChevronUp size={13} />
          {request.votes}
        </button>
      </div>
    </Card>
  );
}
