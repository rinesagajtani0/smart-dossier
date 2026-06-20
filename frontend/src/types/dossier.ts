export type Phase = 'Intake' | 'ASHK Check' | 'Property Valuation' | 'Legal Review' | 'Final Approval';

export type RiskLevel = 'low' | 'medium' | 'high';

export type CaseStatus = 'open' | 'closed';

export interface DossierEvent {
  id: string;
  date: string;
  description: string;
}

export interface DossierSource {
  id: string;
  label: string;
  url?: string;
}

export interface Dossier {
  id: string;
  subject: string;
  category: string;
  phase: Phase;
  status: CaseStatus;
  riskLevel: RiskLevel;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deadline: string;
  events: DossierEvent[];
  sources: DossierSource[];
}

export interface KanbanCardSummary {
  id: string;
  title: string;
  applicantName: string | null;
  propertyLocation: string | null;
  propertyType: string | null;
  status: CaseStatus;
  riskLevel: RiskLevel;
  deadline: string | null;
  missingFields: string[];
}

export type KanbanColumns = Record<Phase, KanbanCardSummary[]>;

export interface DashboardStats {
  totalDossiers: number;
  highRisk: number;
  delayed: number;
  rejected: number;
  deadlinesThisWeek: number;
  mainBottleneck: string | null;
  byPhase: Record<string, number>;
  byRisk: Record<string, number>;
}
