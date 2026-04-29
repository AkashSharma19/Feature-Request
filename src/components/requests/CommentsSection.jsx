import { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Textarea, Button } from '../ui';
import { timeAgo, cn } from '../../lib/utils';

export default function CommentsSection({ featureId }) {
  const { comments, addComment } = useStore();
  const featureComments = comments[featureId] || [];
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    addComment(featureId, text.trim(), isInternal);
    setText('');
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
                c.internal ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                c.internal ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
              )}>
                {c.avatar || c.user?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700">{c.user}</span>
                  {c.internal && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5">
                      <Lock size={8} /> Internal
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(c.date)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <Textarea
          rows={3}
          placeholder={isInternal ? 'Add an internal admin note (not visible to users)…' : 'Add a comment…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border-0 rounded-none focus:ring-0 resize-none"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-t border-gray-100">
          <button
            onClick={() => setIsInternal(!isInternal)}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all',
              isInternal
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
            )}
          >
            <Lock size={11} />
            {isInternal ? 'Internal Note' : 'Mark as Internal'}
          </button>
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
    </div>
  );
}
