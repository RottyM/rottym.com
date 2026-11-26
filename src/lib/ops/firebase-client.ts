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
const DRIVE_TOKEN_EXP_KEY = 'ops_google_drive_token_exp';
const DRIVE_EMAIL_KEY = 'ops_google_drive_email';

export function getGoogleDriveAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = sessionStorage.getItem(DRIVE_TOKEN_KEY);
    if (!token) return null;
    const expRaw = sessionStorage.getItem(DRIVE_TOKEN_EXP_KEY);
    if (expRaw) {
      const exp = Number(expRaw);
      if (Number.isFinite(exp) && Date.now() >= exp) {
        return null;
      }
    }
    return token;
  } catch {
    return null;
  }
}

export function getGoogleDriveAccountEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(DRIVE_EMAIL_KEY);
  } catch {
    return null;
  }
}

export const DRIVE_TOKEN_EVENT = 'ops-drive-token-updated';

export function clearGoogleDriveAccessToken() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(DRIVE_TOKEN_KEY);
    sessionStorage.removeItem(DRIVE_TOKEN_EXP_KEY);
    sessionStorage.removeItem(DRIVE_EMAIL_KEY);
    window.dispatchEvent(new Event(DRIVE_TOKEN_EVENT));
  } catch {
    // ignore storage failure
  }
}

export async function signInOpsWithGoogle(options?: { requireDriveToken?: boolean }) {
  const auth = getOpsAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.setCustomParameters({
    prompt: options?.requireDriveToken ? 'consent select_account' : 'select_account',
    include_granted_scopes: 'true',
  });
  const cred = await signInWithPopup(auth, provider);
  const oauth = GoogleAuthProvider.credentialFromResult(cred);
  if (options?.requireDriveToken && !oauth?.accessToken) {
    throw new Error('Google sign-in completed without a Drive OAuth token — make sure Drive access is checked.');
  }
  if (oauth?.accessToken && typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(DRIVE_TOKEN_KEY, oauth.accessToken);
      sessionStorage.setItem(DRIVE_TOKEN_EXP_KEY, String(Date.now() + 50 * 60 * 1000));
      if (cred.user?.email) {
        sessionStorage.setItem(DRIVE_EMAIL_KEY, cred.user.email);
      }
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
  clearGoogleDriveAccessToken();
  return signOut(auth);
}
