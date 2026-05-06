import { create } from 'zustand';
import { 
  collection, addDoc, onSnapshot, query, where, orderBy, 
  doc, updateDoc, deleteDoc, setDoc, getDoc, limit, getDocs
} from 'firebase/firestore';
import { 
  signInWithPopup, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';

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
        } else {
          set({ user, userOrg: null, isAuthLoading: false });
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
      set({ requests: [], boards: [], questionnaires: {}, activeOrgId: orgId, activeUnsubs: null });
    } else {
      set({ activeOrgId: orgId });
    }

    // Fail-safe fetch for browsers blocking real-time sync
    getDocs(query(collection(db, 'requests'), where('orgId', '==', orgId)))
      .then(snap => {
        if (get().requests.length === 0 && snap.docs.length > 0) {
          set({ requests: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
        }
      })
      .catch(err => console.error("Initial data fetch failed:", err));

    getDocs(query(collection(db, 'boards'), where('orgId', '==', orgId)))
      .then(snap => {
        if (get().boards.length === 0 && snap.docs.length > 0) {
          set({ boards: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
        }
      });

    const unsubRequests = onSnapshot(
      query(collection(db, 'requests'), where('orgId', '==', orgId)),
      (snapshot) => {
        set({ requests: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
      },
      (error) => console.error(`Error subscribing to requests:`, error)
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
      unsubBoards();
      unsubClickUp();
      unsubNotifications();
      unsubQuestionnaires();
      // Note: We don't null out activeOrgId/activeUnsubs here because other components might still need them
      // This is a singleton-ish approach for the current org
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
    await updateDoc(doc(db, 'requests', id), updates);
  },

  deleteRequest: async (id) => {
    await deleteDoc(doc(db, 'requests', id));
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
}));
