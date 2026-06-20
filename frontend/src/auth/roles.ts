// These three roles mirror the roles already modeled on the backend's
// /roles endpoints (see roleService.ts's RoleCatalogEntry id: 'staff' |
// 'manager' | 'citizen') — this file does not invent new roles, it gives
// the existing three a frontend access-control identity.
export type Role = 'citizen' | 'staff' | 'manager';

export interface RoleDefinition {
  id: Role;
  label: string;
  description: string;
}

export const ROLES: Record<Role, RoleDefinition> = {
  citizen: {
    id: 'citizen',
    label: 'Citizen',
    description: 'Applicant tracking and managing their own dossier.',
  },
  staff: {
    id: 'staff',
    label: 'Staff',
    description: 'Civil servant who manages dossiers through the registration process.',
  },
  manager: {
    id: 'manager',
    label: 'Manager',
    description: 'Oversees institution-wide performance, analytics, and reporting.',
  },
};

export const ALL_ROLES: Role[] = Object.keys(ROLES) as Role[];

export function isRole(value: string): value is Role {
  return (ALL_ROLES as string[]).includes(value);
}
