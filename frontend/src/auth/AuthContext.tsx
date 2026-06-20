import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isRole } from './roles';
import type { Role } from './roles';
import { AuthContext } from './authContextStore';
import type { AuthContextValue } from './authContextStore';

// Stand-in identity layer: this app has no real authentication (synthetic
// demo data only), so "who is logged in" is a role picked from a switcher
// instead of a session. Every consumer only ever calls useAuth() — swapping
// this for a real session/JWT later means changing this file alone.
const STORAGE_KEY = 'smart-dossier:role';
const DEFAULT_ROLE: Role = 'citizen';

function readStoredRole(): Role {
  if (typeof window === 'undefined') return DEFAULT_ROLE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isRole(stored) ? stored : DEFAULT_ROLE;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(readStoredRole);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const value = useMemo<AuthContextValue>(() => ({ role, setRole }), [role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
