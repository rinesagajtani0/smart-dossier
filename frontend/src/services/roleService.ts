import type { RiskLevel } from '../types/dossier';
import { localizeText, mapLocationToAlbania } from '../utils/albania';
import { request } from './apiClient';

export interface RoleCatalogEntry {
  id: 'staff' | 'manager' | 'citizen';
  label: string;
  description: string;
  entryPoint: string;
}

export interface StaffDossier {
  id: number;
  trackingCode: string;
  title: string;
  applicantName?: string | null;
  propertyLocation?: string | null;
  phase: string;
  institution: string;
  status: string;
  deadline?: string | null;
  riskLevel: 'low' | 'medium' | 'high';
  missingFields: string[];
  needsAttention: boolean;
}

export interface StaffWorkbench {
  role: 'staff';
  dossier: StaffDossier;
  nextAction: {
    type: string;
    label: string;
    reason: string;
  };
  processStep: {
    phase: string;
    institution: string;
    requiredDocuments: string[];
    criticalPoint: boolean;
    expectedDays: number;
    nextPhase?: string | null;
  } | null;
  aiTools: string[];
}

export interface ManagerDashboard {
  role: 'manager';
  totals: {
    dossiers: number;
    highRisk: number;
    delayed: number;
    rejected: number;
    deadlinesThisWeek: number;
  };
  bottlenecks: Array<{
    phase: string;
    count: number;
  }>;
  highRiskDossiers: Array<StaffDossier & { daysUntilDeadline: number | null }>;
  recommendedFocus: (StaffDossier & { daysUntilDeadline: number | null }) | null;
}

export interface CitizenTracking {
  role: 'citizen';
  dossier: {
    trackingCode: string;
    title: string;
    processType: string;
    applicantName?: string | null;
    propertyLocation?: string | null;
    phase: string;
    institution: string;
    status: string;
    deadline?: string | null;
    nextStep: string;
    citizenMessage: string;
    publicRiskLabel: string;
  };
}

export async function getRoleCatalog(): Promise<RoleCatalogEntry[]> {
  const response = await request<{ roles: RoleCatalogEntry[] }>('/roles');
  return response.roles;
}

// Backend data uses Kosovo place names — remapped to Albanian municipalities
// for display only (see utils/albania.ts), without touching the API response.
function localizeStaffDossier<T extends StaffDossier>(dossier: T): T {
  return {
    ...dossier,
    title: localizeText(dossier.title),
    propertyLocation: mapLocationToAlbania(dossier.propertyLocation ?? null),
  };
}

export interface StaffDossierFilters {
  phase?: string;
  riskLevel?: RiskLevel;
}

export async function getStaffDossiers(filters: StaffDossierFilters = {}): Promise<StaffDossier[]> {
  const params = new URLSearchParams();
  if (filters.phase) params.set('phase', filters.phase);
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
  const query = params.toString();

  const response = await request<{ dossiers: StaffDossier[] }>(
    `/roles/staff/dossiers${query ? `?${query}` : ''}`,
  );
  return response.dossiers.map(localizeStaffDossier);
}

export async function getStaffWorkbench(id: number): Promise<StaffWorkbench> {
  const workbench = await request<StaffWorkbench>(`/roles/staff/dossiers/${id}/workbench`);
  return { ...workbench, dossier: localizeStaffDossier(workbench.dossier) };
}

export async function getManagerDashboard(): Promise<ManagerDashboard> {
  const dashboard = await request<ManagerDashboard>('/roles/manager/dashboard');
  return {
    ...dashboard,
    highRiskDossiers: dashboard.highRiskDossiers.map(localizeStaffDossier),
    recommendedFocus: dashboard.recommendedFocus ? localizeStaffDossier(dashboard.recommendedFocus) : null,
  };
}

export async function getCitizenTracking(trackingCode: string, accessCode: string): Promise<CitizenTracking> {
  const params = new URLSearchParams({ accessCode });
  const tracking = await request<CitizenTracking>(`/roles/citizen/track/${trackingCode}?${params.toString()}`);
  return {
    ...tracking,
    dossier: {
      ...tracking.dossier,
      title: localizeText(tracking.dossier.title),
      propertyLocation: mapLocationToAlbania(tracking.dossier.propertyLocation ?? null),
    },
  };
}
