import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui';
import { formatDate } from '../lib/utils';
import { ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
import CommentsSection from '../components/requests/CommentsSection';
import { useAdmin } from '../lib/useAdmin';

export default function ChangelogsPage() {
  const { orgId: urlOrgId } = useParams();
  const { requests, releaseNoteLikes, toggleReleaseNoteLike, userOrg, subscribeToAll, activeOrgId } = useStore();
  const isAdmin = useAdmin();

  // Handle subscription switching
  useEffect(() => {
    const targetOrgId = urlOrgId || userOrg?.id;
    if (targetOrgId && activeOrgId !== targetOrgId) {
      const unsub = subscribeToAll(targetOrgId);
      return () => unsub && unsub();
    }
  }, [urlOrgId, userOrg, subscribeToAll, activeOrgId]);

  
  const releaseNotes = requests
    .filter(r => r.isReleaseNote)
    .sort((a, b) => new Date(b.releaseNoteDate || b.createdAt) - new Date(a.releaseNoteDate || a.createdAt));

  const [openComments, setOpenComments] = useState({});

  const toggleComments = (id) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Changelogs</h1>
        <p className="text-gray-500 mt-1">See the latest updates, features, and improvements.</p>
      </div>

      {releaseNotes.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No release notes yet</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            When features are completed, admins can publish release notes here to keep everyone updated.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {releaseNotes.map(note => {
            const isLiked = releaseNoteLikes[note.id];
            
            return (
              <Card key={note.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white bg-gray-900 px-3 py-1 rounded-full uppercase tracking-wide">
                      {note.category || 'Update'}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {formatDate(note.releaseNoteDate || note.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    <Link to={isAdmin ? `/admin/requests/${note.id}` : `/b/${urlOrgId}/requests/${note.id}`} className="hover:text-gray-900 transition-colors">
                      {note.releaseNoteTitle || note.title}
                    </Link>
                  </h2>
                  
                  <div className="prose prose-sm prose-teal max-w-none text-gray-600 mb-4 whitespace-pre-wrap">
                    {note.releaseNoteDescription || note.description}
                  </div>

                  {note.releaseNoteLink && (
                    <div className="mb-6">
                      <a 
                        href={note.releaseNoteLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-black px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} /> Support Documentation
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleReleaseNoteLike(note.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isLiked ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    
                    <button
                      onClick={() => toggleComments(note.id)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Comments
                    </button>
                  </div>
                </div>

                {openComments[note.id] && (
                  <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <CommentsSection featureId={note.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
