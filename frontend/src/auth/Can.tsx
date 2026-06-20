import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { hasAnyPermission } from './permissions';
import type { Permission } from './permissions';

interface CanProps {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

// Component-level permission guard. Use this instead of checking `role`
// directly inside a component — the rule lives in permissions.ts, this just
// renders (or hides) based on it.
export function Can({ permission, fallback = null, children }: CanProps) {
  const { role } = useAuth();
  const required = Array.isArray(permission) ? permission : [permission];

  return hasAnyPermission(role, required) ? <>{children}</> : <>{fallback}</>;
}
