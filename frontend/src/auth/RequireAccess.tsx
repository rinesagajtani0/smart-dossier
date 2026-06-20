import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { hasAnyPermission } from './permissions';
import type { Permission } from './permissions';

interface RequireAccessProps {
  permissions: Permission[];
  children: ReactNode;
}

export function RequireAccess({ permissions, children }: RequireAccessProps) {
  const { role } = useAuth();
  const location = useLocation();

  if (!hasAnyPermission(role, permissions)) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
