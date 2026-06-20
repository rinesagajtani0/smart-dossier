import type { RiskLevel } from '../types/dossier';
import { request } from './apiClient';

export interface LegalChangeSummary {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  affectedPhases: string[];
  severity: RiskLevel;
}

export interface DossierRequiringReview {
  id: number;
  trackingCode: string;
  processType: string;
  phase: string;
}

export interface LegalImpactGraphResult {
  legalChangeId: string;
  legalChangeTitle: string;
  legalChangeApplies: boolean;
  affectedNodes: string[];
  affectedTransitions: string[];
  affectedDossiers: number;
  dossiersRequiringReview: DossierRequiringReview[];
  impactScore: number;
  severity: RiskLevel;
  changedFields: string[];
  addedRequiredDocuments: string[];
  recommendedAction: string;
}

export async function getLegalChanges(): Promise<LegalChangeSummary[]> {
  return request<LegalChangeSummary[]>('/graph/legal-changes');
}

export async function getLegalImpactGraph(legalChangeId: string): Promise<LegalImpactGraphResult> {
  return request<LegalImpactGraphResult>(`/graph/legal-impact/${legalChangeId}`);
}
