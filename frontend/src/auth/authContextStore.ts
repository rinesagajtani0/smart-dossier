import { createContext } from 'react';
import type { Role } from './roles';

export interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
