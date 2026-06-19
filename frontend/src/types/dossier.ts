export type Phase = 'submitted' | 'verification' | 'valuation' | 'approval' | 'completed';

export type RiskLevel = 'low' | 'medium' | 'high';

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
  riskLevel: RiskLevel;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deadline: string;
  events: DossierEvent[];
  sources: DossierSource[];
}
