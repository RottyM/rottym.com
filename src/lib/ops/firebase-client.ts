'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rottym-com-vibe',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedDb: Firestore | null = null;

export function hasFirebaseClientConfig(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

export function getOpsFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

export function getOpsAuth(): Auth {
  return getAuth(getOpsFirebaseApp());
}

export function getOpsFirestore(): Firestore {
  if (cachedDb) return cachedDb;
  const app = getOpsFirebaseApp();
  try {
    cachedDb = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}

const DRIVE_TOKEN_KEY = 'ops_google_drive_token';

export function getGoogleDriveAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(DRIVE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export const DRIVE_TOKEN_EVENT = 'ops-drive-token-updated';

export async function signInOpsWithGoogle() {
  const auth = getOpsAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const oauth = GoogleAuthProvider.credentialFromResult(cred);
  if (oauth?.accessToken && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(DRIVE_TOKEN_KEY, oauth.accessToken);
      window.dispatchEvent(new Event(DRIVE_TOKEN_EVENT));
    } catch {
      // ignore storage failure
    }
  }
  return cred;
}

export async function signInOpsWithEmail(email: string, password: string) {
  const auth = getOpsAuth();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutOps() {
  const auth = getOpsAuth();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(DRIVE_TOKEN_KEY);
    } catch {
      // ignore
    }
  }
  return signOut(auth);
}
