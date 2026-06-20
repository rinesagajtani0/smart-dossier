import { request } from './apiClient';

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

export async function getStaffDossiers(): Promise<StaffDossier[]> {
  const response = await request<{ dossiers: StaffDossier[] }>('/roles/staff/dossiers');
  return response.dossiers;
}

export async function getStaffWorkbench(id: number): Promise<StaffWorkbench> {
  return request<StaffWorkbench>(`/roles/staff/dossiers/${id}/workbench`);
}

export async function getManagerDashboard(): Promise<ManagerDashboard> {
  return request<ManagerDashboard>('/roles/manager/dashboard');
}

export async function getCitizenTracking(trackingCode: string, accessCode: string): Promise<CitizenTracking> {
  const params = new URLSearchParams({ accessCode });
  return request<CitizenTracking>(`/roles/citizen/track/${trackingCode}?${params.toString()}`);
}
