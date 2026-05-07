import { create } from 'zustand';
import { 
  collection, addDoc, onSnapshot, query, where, orderBy, 
  doc, updateDoc, deleteDoc, setDoc, getDoc, limit, getDocs, arrayUnion
} from 'firebase/firestore';
import { 
  signInWithPopup, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { fetchClickUpTask } from '../lib/clickup';

const STATUS_PROGRESS = {
  'Open': 0,
  'In Design': 15,
  'Under Review': 30,
  'In Progress': 50,
  'Development': 70,
  'Testing': 85,
  'Tested': 100,
  'Closed': 100,
  'Cancelled': 0
};

export const useStore = create((set, get) => ({
  // ── SaaS State ──────────────────────────────────────────────
  user: null,
  userOrg: null, // { id, name, ownerId }
  isAuthLoading: true,
  
  // ── Application State ───────────────────────────────────────
  requests: [],
  votes: JSON.parse(localStorage.getItem('user_votes') || '{}'),
  roadmapItems: [],
  clickupSettings: { apiKey: '', teamId: '', statusMap: {} },
  notificationSettings: {},
  boards: [],
  questionnaires: {},
  releaseNoteLikes: {},
  activeOrgId: null, // Track currently subscribed org
  activeUnsubs: null, // Store active cleanup functions
  isLoading: false,
  comments: {},
  notifications: [],
  unseenNotificationsCount: 0,

  // ── Auth Actions ───────────────────────────────────────────
  initAuth: () => {
    set({ isAuthLoading: true });
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Find organization where user is owner
        const q = query(collection(db, 'organizations'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const orgData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          
          // Self-healing: Check if org has any boards
          const boardsQ = query(collection(db, 'boards'), where('orgId', '==', orgData.id));
          const boardsSnap = await getDocs(boardsQ);
          
          if (boardsSnap.empty) {
            console.log("No boards found for org, creating default...");
            await addDoc(collection(db, 'boards'), {
              name: 'General Feed',
              description: 'Your primary feedback channel.',
              orgId: orgData.id,
              createdAt: new Date().toISOString(),
            });
          }

          set({ user, userOrg: orgData, isAuthLoading: false });
          get().subscribeToAll(orgData.id);
          get().subscribeToNotifications(user.uid);
        } else {
          set({ user, userOrg: null, isAuthLoading: false });
          get().subscribeToNotifications(user.uid);
        }
      } else {
        set({ user: null, userOrg: null, isAuthLoading: false });
      }
    });
  },

  loginWithGoogle: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  },

  logout: async () => {
    await signOut(auth);
    window.location.href = '/';
  },

  createOrganization: async (name) => {
    const user = get().user;
    if (!user) return;

    const orgRef = await addDoc(collection(db, 'organizations'), {
      name,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
    });

    const orgId = orgRef.id;

    // Create a default board for the new organization
    await addDoc(collection(db, 'boards'), {
      name: 'General Feed',
      description: 'Your primary feedback channel.',
      orgId,
      createdAt: new Date().toISOString(),
    });

    const orgData = { id: orgId, name, ownerId: user.uid };
    set({ userOrg: orgData });
    get().subscribeToAll(orgId);
    return orgId;
  },

  // ── Real-time Subscriptions ────────────────────────────────
  subscribeToAll: (orgId) => {
    if (!orgId) return;

    // If already subscribed to this org, return the existing cleanup
    if (get().activeOrgId === orgId && get().activeUnsubs) {
      return get().activeUnsubs;
    }
    
    // Clear old data and unsubs if switching orgs
    if (get().activeOrgId && get().activeOrgId !== orgId) {
      if (get().activeUnsubs) get().activeUnsubs();
      set({ requests: [], boards: [], questionnaires: {}, activeOrgId: orgId, activeUnsubs: null, isLoading: true });
    } else {
      set({ activeOrgId: orgId, isLoading: true });
    }

    // Fail-safe fetch for browsers blocking real-time sync
    const p1 = getDocs(query(collection(db, 'requests'), where('orgId', '==', orgId)))
      .then(snap => {
        if (get().requests.length === 0 && snap.docs.length > 0) {
          set({ requests: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
        }
      });

    const p2 = getDocs(query(collection(db, 'boards'), where('orgId', '==', orgId)))
      .then(snap => {
        if (get().boards.length === 0 && snap.docs.length > 0) {
          set({ boards: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
        }
      });

    const p3 = getDocs(query(collection(db, 'roadmap'), where('orgId', '==', orgId)))
      .then(snap => {
        if (get().roadmapItems.length === 0 && snap.docs.length > 0) {
          set({ roadmapItems: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
        }
      });

    // When all initial fetches are done, turn off loader
    Promise.all([p1, p2, p3]).finally(() => set({ isLoading: false }));

    const unsubRequests = onSnapshot(
      query(collection(db, 'requests'), where('orgId', '==', orgId)),
      (snapshot) => {
        set({ requests: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
      },
      (error) => console.error(`Error subscribing to requests:`, error)
    );

    const unsubRoadmap = onSnapshot(
      query(collection(db, 'roadmap'), where('orgId', '==', orgId)),
      (snapshot) => {
        set({ roadmapItems: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
      },
      (error) => console.error(`Roadmap sync error:`, error)
    );

    const unsubBoards = onSnapshot(
      query(collection(db, 'boards'), where('orgId', '==', orgId)),
      (snapshot) => {
        set({ boards: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
      },
      (error) => console.error(`Boards sync error:`, error)
    );

    const unsubClickUp = onSnapshot(doc(db, 'organizations', orgId, 'settings', 'clickup'), (doc) => {
      if (doc.exists()) set({ clickupSettings: doc.data() });
    });

    const unsubNotifications = onSnapshot(doc(db, 'organizations', orgId, 'settings', 'notifications'), (doc) => {
      if (doc.exists()) set({ notificationSettings: doc.data() });
    });

    const unsubQuestionnaires = onSnapshot(collection(db, 'organizations', orgId, 'questionnaires'), (snapshot) => {
      const q = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!q[data.boardId]) q[data.boardId] = [];
        q[data.boardId].push({ id: doc.id, ...data });
      });
      set({ questionnaires: q });
    }, (err) => console.error("Questionnaires sync error:", err));

    const cleanup = () => {
      unsubRequests();
      unsubRoadmap();
      unsubBoards();
      unsubClickUp();
      unsubNotifications();
      unsubQuestionnaires();
    };

    set({ activeUnsubs: cleanup });
    return cleanup;
  },

  // ── Actions (Namespaced by Org) ────────────────────────────
  addRequest: async (data) => {
    const orgId = data.orgId || get().userOrg?.id;
    if (!orgId) throw new Error("No organization ID found");

    const initialStatus = 'Open';
    const newRequest = {
      ...data,
      orgId,
      status: initialStatus,
      votes: 0,
      progress: STATUS_PROGRESS[initialStatus] || 0,
      createdAt: new Date().toISOString(),
      pinned: false,
      boardId: data.boardId || null,
      responses: data.responses || {},
      activityLog: [
        { id: `a-${Date.now()}`, type: 'created', text: 'Request created', date: new Date().toISOString(), user: data.requestedBy || 'User' },
      ],
    };

    const docRef = await addDoc(collection(db, 'requests'), newRequest);
    return docRef.id;
  },

  updateRequest: async (id, updates) => {
    const user = get().user;
    const finalUpdates = { ...updates };
    
    // Automatically update progress if status changes
    if (updates.status && STATUS_PROGRESS[updates.status] !== undefined) {
      finalUpdates.progress = STATUS_PROGRESS[updates.status];
    }

    // Add activity log if status or assignee changes
    if (updates.status || updates.assignee) {
      const activityText = updates.status 
        ? `Status updated to ${updates.status}`
        : `Assigned to ${updates.assignee}`;
      
      finalUpdates.activityLog = arrayUnion({
        id: `a-${Date.now()}`,
        type: updates.status ? 'status' : 'priority',
        text: activityText,
        date: new Date().toISOString(),
        user: user?.displayName || user?.email || 'Admin'
      });
    }

    await updateDoc(doc(db, 'requests', id), finalUpdates);

    // If status changed, notify owner
    if (updates.status) {
      const request = get().requests.find(r => r.id === id);
      if (request && request.userId) {
        get().createNotification(request.userId, {
          type: 'status_change',
          text: `The status of your request "${request.title}" has been updated to "${updates.status}"`,
          featureId: id,
          requestId: id
        });
      }
    }
  },

  deleteRequest: async (id) => {
    await deleteDoc(doc(db, 'requests', id));
  },

  syncAllClickUpTasks: async () => {
    const { requests, clickupSettings, updateRequest } = get();
    if (!clickupSettings.apiKey) throw new Error("ClickUp API Key not configured");

    const tasksToSync = requests.filter(r => r.clickupTaskId);
    if (tasksToSync.length === 0) return 0;

    let successCount = 0;
    for (const req of tasksToSync) {
      try {
        const res = await fetchClickUpTask(
          req.clickupTaskId,
          clickupSettings.apiKey,
          clickupSettings.teamId,
          clickupSettings.statusMap
        );

        if (res && res.status) {
          await updateRequest(req.id, { status: res.status, updatedBy: 'ClickUp' });
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to sync task ${req.clickupTaskId}:`, error);
      }
    }
    return successCount;
  },

  // Roadmap Actions
  moveRoadmapItem: async (id, updates) => {
    await updateDoc(doc(db, 'roadmap', id), updates);
  },

  addToRoadmap: async (item) => {
    const orgId = get().userOrg?.id;
    await addDoc(collection(db, 'roadmap'), { ...item, orgId });
  },

  removeFromRoadmap: async (id) => {
    await deleteDoc(doc(db, 'roadmap', id));
  },

  // Comments
  subscribeToComments: (featureId) => {
    return onSnapshot(
      query(collection(db, 'requests', featureId, 'comments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set(state => ({
          comments: { ...state.comments, [featureId]: items }
        }));
      }
    );
  },

  addComment: async (featureId, text, metadata = {}) => {
    const user = get().user;
    await addDoc(collection(db, 'requests', featureId, 'comments'), {
      text,
      ...metadata,
      authorId: user?.uid || 'Guest',
      authorName: user?.displayName || user?.email || 'Guest',
      createdAt: new Date().toISOString()
    });

    // Notify request owner
    const request = get().requests.find(r => r.id === featureId);
    if (request && request.userId && request.userId !== user?.uid) {
      get().createNotification(request.userId, {
        type: 'comment',
        text: `${user?.displayName || 'Someone'} commented on your request: "${request.title}"`,
        featureId,
        requestId: featureId
      });
    }
  },

  toggleVote: (id) => {
    const votes = { ...get().votes };
    if (votes[id]) {
      delete votes[id];
      updateDoc(doc(db, 'requests', id), { votes: (get().requests.find(r => r.id === id).votes || 1) - 1 });
    } else {
      votes[id] = true;
      updateDoc(doc(db, 'requests', id), { votes: (get().requests.find(r => r.id === id).votes || 0) + 1 });
    }
    set({ votes });
    localStorage.setItem('user_votes', JSON.stringify(votes));
  },

  // Boards & Form
  addBoard: async (boardData) => {
    const orgId = get().userOrg?.id;
    await addDoc(collection(db, 'boards'), { ...boardData, orgId });
  },

  updateBoard: async (id, updates) => {
    await updateDoc(doc(db, 'boards', id), updates);
  },

  deleteBoard: async (id) => {
    await deleteDoc(doc(db, 'boards', id));
    await deleteDoc(doc(db, 'organizations', get().userOrg.id, 'questionnaires', id));
  },

  updateQuestionnaire: async (boardId, fields) => {
    const orgId = get().userOrg.id;
    await setDoc(doc(db, 'organizations', orgId, 'questionnaires', boardId), { fields });
  },

  updateClickupSettings: async (settings) => {
    const orgId = get().userOrg.id;
    await setDoc(doc(db, 'organizations', orgId, 'settings', 'clickup'), settings, { merge: true });
  },

  updateNotificationSettings: async (settings) => {
    const orgId = get().userOrg.id;
    await setDoc(doc(db, 'organizations', orgId, 'settings', 'notifications'), settings, { merge: true });
  },

  // ── Notifications ──────────────────────────────────────────
  subscribeToNotifications: (userId) => {
    if (!userId) return;
    return onSnapshot(
      query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc'), limit(20)),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const unseen = items.filter(n => !n.seen).length;
        set({ notifications: items, unseenNotificationsCount: unseen });
      }
    );
  },

  markNotificationsAsSeen: async () => {
    const user = get().user;
    if (!user) return;
    const unseen = get().notifications.filter(n => !n.seen);
    const promises = unseen.map(n => 
      updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { seen: true })
    );
    await Promise.all(promises);
  },

  createNotification: async (userId, data) => {
    if (!userId || userId === 'Guest' || userId === get().user?.uid) return;
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      ...data,
      seen: false,
      createdAt: new Date().toISOString()
    });
  },
}));
