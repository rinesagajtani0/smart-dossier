import type { RiskLevel } from '../types/dossier';
import { request } from './apiClient';

export interface LegalImpactGraphResult {
  legalChangeApplies: boolean;
  affectedNodes: string[];
  affectedTransitions: string[];
  affectedDossiers: number;
  impactScore: number;
  severity: RiskLevel;
  changedFields: string[];
  addedRequiredDocuments: string[];
  recommendedAction: string;
}

export async function getLegalImpactGraph(dossierId: string): Promise<LegalImpactGraphResult> {
  return request<LegalImpactGraphResult>(`/graph/legal-impact/${dossierId}`);
}
