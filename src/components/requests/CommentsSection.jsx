import { useState, useEffect } from 'react';
import { Send, Lock, AlertCircle, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Textarea, Button } from '../ui';
import { useAdmin } from '../../lib/useAdmin';
import { timeAgo, cn } from '../../lib/utils';

export default function CommentsSection({ featureId }) {
  const { comments, addComment, subscribeToComments, user, toggleCommentLike } = useStore();
  const isAdmin = useAdmin();

  useEffect(() => {
    if (!featureId) return;
    const unsub = subscribeToComments(featureId);
    return () => unsub();
  }, [featureId, subscribeToComments]);

  const featureComments = comments[featureId] || [];
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [actionNeeded, setActionNeeded] = useState(false);


  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(featureId, text.trim(), { 
      isInternal, 
      actionNeeded: isAdmin ? actionNeeded : false, 
      authorIsAdmin: isAdmin,
      authorName: user?.displayName || user?.email || (isAdmin ? 'Admin' : 'User')
    });
    setText('');
    setActionNeeded(false);
  };

  return (
    <div className="space-y-4">
      {/* Comments list */}
      {featureComments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to add one.</p>
      ) : (
        <div className="space-y-3">
          {featureComments.map((c) => (
            <div
              key={c.id}
              className={cn(
                'flex gap-3 p-3 rounded-xl animate-fade-in',
                c.isInternal ? 'bg-gray-50 border border-gray-100 border-dashed' : 'bg-gray-50'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                c.isInternal ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
              )}>
                {(c.authorName || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700">{c.authorName || 'Anonymous'}</span>
                  {c.isInternal && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-200 rounded-full px-1.5 py-0.5">
                      <Lock size={8} /> Internal
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => toggleCommentLike(featureId, c.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold transition-all",
                      c.likes?.includes(user?.uid) ? "text-red-500" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <Heart size={12} fill={c.likes?.includes(user?.uid) ? "currentColor" : "none"} />
                    {c.likes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {!user ? (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
          <p className="text-sm text-gray-500 mb-3 font-medium">Log in to join the conversation</p>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/login'}>
            Log in to Comment
          </Button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <Textarea
            rows={3}
            placeholder={isInternal ? 'Add an internal admin note (not visible to users)…' : 'Add a comment…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border-0 rounded-none focus:ring-0 resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsInternal(!isInternal)}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all',
                      isInternal
                        ? 'bg-gray-900 text-white border border-gray-900 shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                    )}
                  >
                    <Lock size={11} />
                    {isInternal ? 'Internal Note' : 'Mark as Internal'}
                  </button>

                  {!isInternal && (
                    <button
                      onClick={() => setActionNeeded(!actionNeeded)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all',
                        actionNeeded
                          ? 'bg-gray-900 text-white border border-gray-900 shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                      )}
                    >
                      <AlertCircle size={11} />
                      {actionNeeded ? 'Action Needed' : 'Request Action'}
                    </button>
                  )}
                </>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim()}
            >
              <Send size={12} />
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
