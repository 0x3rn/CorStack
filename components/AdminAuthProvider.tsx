'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
type AuthState = [User | null, boolean, string | null];
const AdminAuthContext = createContext<AuthState>([null, true, null]);
export const useAdminAuth = () => useContext(AdminAuthContext);
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>([null, true, null]);
  useEffect(() => {
    let disposed = false;
    let version = 0;
    let unsubscribe: (() => void) | undefined;
    Promise.all([import('@/lib/firebase'), import('firebase/auth')]).then(([firebase, sdk]) => {
      if (disposed) return;
      const auth = firebase.getFirebaseAuth();
      unsubscribe = sdk.onIdTokenChanged(auth, async candidate => {
        const current = ++version;
        if (!candidate) { setState(previous => [null, false, previous[2]]); return; }
        setState([null, true, null]);
        try {
          const token = await candidate.getIdToken();
          const response = await fetch('/api/admin/session', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
          const result = await response.json();
          if (disposed || current !== version) return;
          if (!response.ok) {
            setState([null, false, result.error || 'Unable to verify admin access.']);
            if (response.status === 401 || response.status === 403) await sdk.signOut(auth);
            return;
          }
          setState([candidate, false, null]);
        } catch {
          if (!disposed && current === version) setState([null, false, 'Unable to verify admin access. Please try again.']);
        }
      }, () => { if (!disposed) setState([null, false, 'Unable to load your session.']); });
    }).catch(() => { if (!disposed) setState([null, false, 'Admin sign-in is temporarily unavailable.']); });
    return () => { disposed = true; version++; unsubscribe?.(); };
  }, []);
  return <AdminAuthContext.Provider value={state}>{children}</AdminAuthContext.Provider>;
}
