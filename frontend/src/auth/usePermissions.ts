import { useAuth } from './useAuth';
import { getPermissionsForRole, hasAllPermissions, hasAnyPermission, hasPermission } from './permissions';
import type { Permission } from './permissions';

interface UsePermissionsResult {
  role: ReturnType<typeof useAuth>['role'];
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { role } = useAuth();

  return {
    role,
    permissions: getPermissionsForRole(role),
    can: (permission) => hasPermission(role, permission),
    canAny: (permissions) => hasAnyPermission(role, permissions),
    canAll: (permissions) => hasAllPermissions(role, permissions),
  };
}
