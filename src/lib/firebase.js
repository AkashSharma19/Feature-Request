import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';



const firebaseConfig = {
  apiKey: "AIzaSyC6WoSoKFxwe5lawqGWciZ0R8sGVwylgOo",
  authDomain: "feature-roadmap.firebaseapp.com",
  projectId: "feature-roadmap",
  storageBucket: "feature-roadmap.firebasestorage.app",
  messagingSenderId: "393651449716",
  appId: "1:393651449716:web:a8dfa224da217e1d4fc621",
  measurementId: "G-0R027LSN2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional, only works in browser environments)

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
