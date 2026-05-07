import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronUp, Pin, MoreHorizontal, Edit2, Archive, Trash2, GitMerge, CheckSquare
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { StatusBadge, ProgressBar, Button } from '../ui';
import { useStore } from '../../store/useStore';
import { formatDate, cn } from '../../lib/utils';
import { useAdmin } from '../../lib/useAdmin';
import { createPortal } from 'react-dom';

function ActionMenu({ request, onEdit, onArchive, onReject, onPin, onDelete }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) {
      document.addEventListener('mousedown', fn);
      window.addEventListener('scroll', () => setOpen(false), { once: true });
    }
    return () => {
      document.removeEventListener('mousedown', fn);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.right - 176 }); // 176 is width (w-44 = 11rem = 176px)
    }
    setOpen(!open);
  };

  return (
    <div ref={ref}>
      <button
        onClick={toggle}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={14} className="text-gray-400" />
      </button>
      {open && createPortal(
        <div 
          className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-44 animate-scale-in"
          style={{ top: coords.top, left: coords.left }}
        >
          <MenuItem icon={Edit2} label="Edit Request" onClick={() => { onEdit(request); setOpen(false); }} />
          <MenuItem icon={Pin} label={request.pinned ? 'Unpin' : 'Pin'} onClick={() => { onPin(request.id); setOpen(false); }} />
          <MenuItem icon={Archive} label="Archive" onClick={() => { onArchive(request.id); setOpen(false); }} className="text-yellow-600" />
          <div className="my-1 border-t border-gray-100" />
          <MenuItem icon={Trash2} label="Delete" onClick={() => { onDelete(request.id); setOpen(false); }} className="text-red-600" />
        </div>,
        document.body
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors text-gray-700', className)}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

export default function RequestTable({ requests, onEdit, onReject }) {
  const { toggleVote, votes, togglePin, deleteRequest, updateRequest, user } = useStore();
  const navigate = useNavigate();
  const { orgId } = useParams();
  const isAdmin = useAdmin();

  const handleRowClick = (id) => {
    if (isAdmin) {
      navigate(`/admin/requests/${id}`);
    } else if (orgId) {
      navigate(`/b/${orgId}/requests/${id}`);
    }
  };

  const handleVote = (e, id) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleVote(id);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CheckSquare size={22} className="text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No requests found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Feature', 'Status', 'Category', 'Votes', 'Progress', isAdmin ? 'Assignee' : null, isAdmin ? 'Due Date' : null, isAdmin ? '' : null].filter(h => h !== null).map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {requests.map((req, i) => (
            <tr
              key={req.id}
              onClick={() => handleRowClick(req.id)}
              className={cn(
                "group cursor-pointer transition-colors animate-fade-in",
                req.actionNeeded ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50/80"
              )}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Feature name */}
              <td className="px-4 py-3 max-w-[280px]">
                <div className="flex items-center gap-2">
                  {req.pinned && <Pin size={11} className="text-gray-900 flex-shrink-0" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
                        {req.title}
                      </p>
                      {req.actionNeeded && (
                        <span className="text-[9px] font-bold bg-gray-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0 shadow-sm">
                          Action Needed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate max-w-[220px]">{req.description}</p>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={req.status} />
              </td>


              {/* Category */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                  {req.category}
                </span>
              </td>

              {/* Votes */}
              <td className="px-4 py-3">
                <button
                  onClick={(e) => handleVote(e, req.id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all',
                    votes[req.id]
                      ? 'bg-teal-100 text-teal-700 border border-teal-300'
                      : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-teal-50 hover:text-teal-600'
                  )}
                >
                  <ChevronUp size={12} />
                  {req.votes}
                </button>
              </td>

              {/* Progress */}
              <td className="px-4 py-3 min-w-[100px]">
                <div className="flex items-center gap-2">
                  <ProgressBar value={req.progress} className="flex-1" />
                  <span className="text-xs text-gray-400 w-7 text-right">{req.progress}%</span>
                </div>
              </td>

              {/* Assignee */}
              {isAdmin && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-gray-600 font-medium">{req.assignee || 'Unassigned'}</span>
                </td>
              )}

              {/* Due Date */}
              {isAdmin && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatDate(req.deadline)}</span>
                    {(() => {
                      if (!req.deadline) return null;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isOverdue = new Date(req.deadline) < today && !['Closed', 'Tested', 'Cancelled'].includes(req.status);
                      return isOverdue ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Overdue</span>
                      ) : null;
                    })()}
                  </div>
                </td>
              )}

              {/* Actions */}
              {isAdmin && (
                <td className="px-4 py-3">
                  <ActionMenu
                    request={req}
                    onEdit={onEdit}
                    onPin={togglePin}
                    onDelete={deleteRequest}
                    onArchive={(id) => updateRequest(id, { status: 'Rejected' })}
                    onReject={onReject}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
