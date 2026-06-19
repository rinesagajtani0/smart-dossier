export type DossierStatus = 'draft' | 'active' | 'archived';

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
  status: DossierStatus;
  riskLevel: RiskLevel;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  events: DossierEvent[];
  sources: DossierSource[];
}
