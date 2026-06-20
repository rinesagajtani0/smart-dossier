import type { Role } from './roles';

// Scoped to page access / navigation visibility / route protection only —
// not a general capability system. Existing features keep working exactly
// as they did; this only decides who can reach which page (and, for the
// couple of staff-only actions embedded in a shared page, which role sees
// them — see DossierDetailPage/LegalChangePanel/PropertyAlertCard).
export type Permission =
  // Citizen
  | 'view-own-dossier'
  | 'upload-documents'
  | 'view-own-alerts'
  | 'use-procedure-generator'
  | 'track-dossier'
  | 'view-own-delay-prediction'
  | 'view-own-prevent-delay'
  // Staff
  | 'view-dashboard'
  | 'view-dossiers'
  | 'view-nlp-extraction'
  | 'view-case-memory'
  | 'view-delay-prediction'
  | 'use-prevent-delay'
  | 'manage-dossiers'
  | 'view-staff-tools'
  // Manager
  | 'view-manager-reports';

const CITIZEN_PERMISSIONS: Permission[] = [
  'view-own-dossier',
  'upload-documents',
  'view-own-alerts',
  'use-procedure-generator',
  'track-dossier',
  'view-own-delay-prediction',
  'view-own-prevent-delay',
];

const STAFF_PERMISSIONS: Permission[] = [
  'upload-documents',
  'use-procedure-generator',
  'view-dashboard',
  'view-dossiers',
  'view-nlp-extraction',
  'view-case-memory',
  'view-delay-prediction',
  'use-prevent-delay',
  'manage-dossiers',
  'view-staff-tools',
];

const MANAGER_PERMISSIONS: Permission[] = [...STAFF_PERMISSIONS, 'view-manager-reports'];

// --- Permission matrix ------------------------------------------------------
// Single source of truth for "what can this role see". Guards (route-level,
// component-level, nav filtering) all read from this — nothing else in the
// app should check `role === '...'` directly.
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  citizen: CITIZEN_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  if (permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

// --- Route access rules -----------------------------------------------------
// Maps an app route to the permissions allowed to view it (ANY of them — not
// all). A route mapped to an empty array is public to every role. This is
// also what Sidebar nav filtering reads, so "what's in the nav" and "what's
// actually reachable" can't drift apart.
//
// Mapping notes (the role spec names some "pages" that are actually
// sections within an existing route, not separate routes — listed here so
// the mapping isn't silently assumed):
//   - "Alerts" (citizen) / "Property Alerts" (staff) live inside
//     /dossiers/:id (AlertsSection / PropertyAlertsSection), not a
//     standalone route.
//   - "Process Workflow" (staff) is the per-phase breakdown rendered inside
//     /procedure-generator's result panel.
//   - "Dossier Tracking" (citizen) is the citizen tab on /roles
//     (tracking-code + access-code lookup) — distinct from "My Dossier"
//     (/dossiers/:id), which assumes you already have a dossier link.
//   - "Operations Dashboard"/"Analytics"/"Bottleneck Monitoring"/"Risk
//     Monitoring"/"Legal Impact Statistics" (manager) render on the shared
//     /dashboard page (stat cards + Kanban) and the manager tab on /roles.
//     /dashboard itself stays shared with Staff, since Staff's own list
//     also grants "Dashboard" — there is only one DashboardPage component,
//     not a manager-only variant, so it isn't split further here.
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/': [],
  '/procedure-generator': ['use-procedure-generator'],
  '/document-upload': ['upload-documents'],
  '/nlp-extraction': ['view-nlp-extraction'],
  // Staff/manager only — full internal case-matching detail (case IDs,
  // similarity scores, delay reasons). Citizens have no access at all.
  '/case-memory': ['view-case-memory'],
  // Citizens see a simplified view (risk level, estimated delay, missing
  // requirements, recommended actions) with no internal legal/compliance
  // analytics — see DelayPredictionPage / CitizenDelayPredictionPanel.
  '/delay-prediction': ['view-delay-prediction', 'view-own-delay-prediction'],
  // Citizens see a simplified action plan (checklist, missing documents,
  // next steps, guidance) with no generated administrative letter — see
  // PreventDelayPage / CitizenPreventDelayPanel.
  '/prevent-delay': ['use-prevent-delay', 'view-own-prevent-delay'],
  '/dashboard': ['view-dashboard'],
  // Manager-only — reviews graph-driven legal-change propagation across the
  // workflow; not part of Staff's day-to-day tools.
  '/legal-impact': ['view-manager-reports'],
  // /roles bundles a citizen tab, a staff tab, and a manager tab in one
  // page (RolesPage.tsx) behind client-side state, not separate routes.
  // The route itself stays public so each role can reach its own tab;
  // RolesPage gates which tab buttons/content render — see that file.
  '/roles': [],
  '/dossiers/:id': ['view-own-dossier', 'view-dossiers'],
};

export function canAccessRoute(role: Role, routePath: string): boolean {
  const required = ROUTE_PERMISSIONS[routePath];
  if (!required) return true;
  return hasAnyPermission(role, required);
}
