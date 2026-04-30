import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_REQUESTS, MOCK_VOTES, MOCK_COMMENTS, MOCK_ROADMAP_ITEMS } from '../data/mockData';
import { STATUS_PROGRESS } from '../lib/utils';

const CURRENT_USER = 'admin-1';

export const useStore = create(
  persist(
    (set, get) => ({
      currentUser: CURRENT_USER,
      requests: MOCK_REQUESTS,
      votes: MOCK_VOTES,           // { featureId: boolean }
      comments: MOCK_COMMENTS,     // { featureId: Comment[] }
      roadmapItems: MOCK_ROADMAP_ITEMS,
      clickupSettings: { apiKey: '', teamId: '' },
      releaseNoteLikes: {},        // { featureId: boolean }

      // ── Requests ─────────────────────────────────────────────
      addRequest: (data) => {
        const initialStatus = data.status || 'Open';
        const newRequest = {
          id: `fr-${Date.now()}`,
          ...data,
          status: initialStatus,
          votes: 0,
          progress: STATUS_PROGRESS[initialStatus] || 0,
          createdAt: new Date().toISOString(),
          pinned: false,
          activityLog: [
            { id: `a-${Date.now()}`, type: 'created', text: 'Request created', date: new Date().toISOString(), user: data.requestedBy || 'Admin' },
          ],
        };
        set((s) => ({ requests: [newRequest, ...s.requests] }));
        return newRequest;
      },

      updateRequest: (id, updates) => {
        set((s) => ({
          requests: s.requests.map((r) => {
            if (r.id !== id) return r;
            
            const { updatedBy = 'Admin', ...cleanUpdates } = updates;
            
            // Auto-calculate progress if status changes
            if (cleanUpdates.status && cleanUpdates.status !== r.status && cleanUpdates.progress === undefined) {
              cleanUpdates.progress = STATUS_PROGRESS[cleanUpdates.status] || 0;
            }

            const newLog = [...(r.activityLog || [])];
            if (cleanUpdates.status && cleanUpdates.status !== r.status) {
              newLog.push({ id: `a-${Date.now()}`, type: 'status', text: `Status changed to ${cleanUpdates.status}`, date: new Date().toISOString(), user: updatedBy });
            }
            if (cleanUpdates.progress !== undefined && cleanUpdates.progress !== r.progress) {
              newLog.push({ id: `a-${Date.now()+1}`, type: 'progress', text: `Progress updated to ${cleanUpdates.progress}%`, date: new Date().toISOString(), user: updatedBy });
            }
            if (cleanUpdates.assignee && cleanUpdates.assignee !== r.assignee) {
              newLog.push({ id: `a-${Date.now()+3}`, type: 'assignee', text: `Assigned to ${cleanUpdates.assignee}`, date: new Date().toISOString(), user: updatedBy });
            }
            if (cleanUpdates.internalNote !== undefined && cleanUpdates.internalNote !== r.internalNote) {
              newLog.push({ id: `a-${Date.now()+4}`, type: 'internal_note', text: 'Internal note updated', date: new Date().toISOString(), user: updatedBy });
            }
            return { ...r, ...cleanUpdates, activityLog: newLog };
          }),
        }));
      },

      deleteRequest: (id) =>
        set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),

      togglePin: (id) =>
        set((s) => ({
          requests: s.requests.map((r) => r.id === id ? { ...r, pinned: !r.pinned } : r),
        })),

      // ── Voting ────────────────────────────────────────────────
      toggleVote: (featureId) => {
        const { votes, requests } = get();
        const hasVoted = votes[featureId];
        set((s) => ({
          votes: { ...s.votes, [featureId]: !hasVoted },
          requests: s.requests.map((r) =>
            r.id === featureId
              ? { ...r, votes: hasVoted ? r.votes - 1 : r.votes + 1 }
              : r
          ),
        }));
      },

      toggleReleaseNoteLike: (featureId) => {
        const { releaseNoteLikes } = get();
        const hasLiked = releaseNoteLikes[featureId];
        set((s) => ({
          releaseNoteLikes: { ...s.releaseNoteLikes, [featureId]: !hasLiked },
        }));
      },

      // ── Comments ──────────────────────────────────────────────
      addComment: (featureId, text, options = {}) => {
        const { isInternal = false, actionNeeded = false, authorIsAdmin = true, authorName = 'Admin User' } = options;
        const newComment = { id: Date.now().toString(), text, date: new Date().toISOString(), user: authorName, internal: isInternal };
        set((s) => ({
          comments: { ...s.comments, [featureId]: [...(s.comments[featureId] || []), newComment] },
          requests: s.requests.map(r => {
            if (r.id !== featureId) return r;
            
            let updatedRequest = {
              ...r,
              activityLog: [...(r.activityLog || []), {
                id: Date.now().toString(),
                type: isInternal ? 'internal_note' : 'comment',
                text: isInternal ? 'Internal note added' : 'Comment added',
                date: new Date().toISOString(),
                user: authorName,
              }],
            };

            if (actionNeeded) {
              updatedRequest.actionNeeded = true;
            } else if (!authorIsAdmin && !isInternal) {
              updatedRequest.actionNeeded = false;
            }

            return updatedRequest;
          }),
        }));
      },

      // ── Roadmap ───────────────────────────────────────────────
      moveRoadmapItem: (itemId, newQuarter, newYear) => {
        set((s) => ({
          roadmapItems: s.roadmapItems.map((item) =>
            item.id === itemId ? { ...item, quarter: newQuarter, year: newYear || item.year } : item
          ),
        }));
      },

      addToRoadmap: (featureId, quarter, year) => {
        const { roadmapItems } = get();
        const existing = roadmapItems.find((i) => i.featureId === featureId);
        if (existing) {
          set((s) => ({
            roadmapItems: s.roadmapItems.map((i) =>
              i.id === existing.id ? { ...i, quarter, year } : i
            ),
          }));
        } else {
          set((s) => ({
            roadmapItems: [
              ...s.roadmapItems,
              { id: `rm-${Date.now()}`, featureId, quarter, year, position: s.roadmapItems.length },
            ],
          }));
        }
      },

      removeFromRoadmap: (featureId) => {
        set((s) => ({
          roadmapItems: s.roadmapItems.filter((i) => i.featureId !== featureId),
        }));
      },

      setClickupSettings: (settings) => {
        set((s) => ({ clickupSettings: { ...s.clickupSettings, ...settings } }));
      },
    }),
    {
      name: 'feature-request-store',
    }
  )
);
