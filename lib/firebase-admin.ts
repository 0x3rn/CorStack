import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  // Handle both literal \n (from Vercel UI) and escaped \\n (from .env files)
  // Also strip out any stray quotes if someone pasted it with quotes
  return key.replace(/\\n/g, '\n').replace(/"/g, '');
};

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

let app;
try {
  app = getApps().length === 0 ? initializeApp({
    credential: cert(serviceAccount),
  }) : getApps()[0];
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
  // Fallback to empty app or re-throw depending on your preference
  // We'll leave it undefined, which will cause db calls to fail but not crash the whole server
}

export const db = getFirestore(app as any);
export const adminAuth = getAuth(app as any);
export const storage = getStorage(app as any);
