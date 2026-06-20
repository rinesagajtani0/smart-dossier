import type { DashboardStats, KanbanCardSummary, KanbanColumns } from '../types/dossier';
import { PHASES } from '../data/phases';
import { mapCaseStatus } from '../utils/phase';
import { request } from './apiClient';
import type { ApiLegalChangeImpact } from './dossierService';
import { mapLegalChangeImpact } from './dossierService';

interface ApiKanbanCard {
  id: number;
  title: string;
  applicantName?: string | null;
  propertyLocation?: string | null;
  propertyType?: string | null;
  status: string;
  riskLevel: 'low' | 'medium' | 'high';
  deadline?: string | null;
  missingFields?: string[];
  legalChangeImpact?: ApiLegalChangeImpact | null;
}

interface ApiKanbanResponse {
  columns: Record<string, ApiKanbanCard[]>;
}

function mapKanbanCard(card: ApiKanbanCard): KanbanCardSummary {
  return {
    id: String(card.id),
    title: card.title,
    applicantName: card.applicantName ?? null,
    propertyLocation: card.propertyLocation ?? null,
    propertyType: card.propertyType ?? null,
    status: mapCaseStatus(card.status),
    riskLevel: card.riskLevel,
    deadline: card.deadline ?? null,
    missingFields: card.missingFields ?? [],
    legalChangeImpact: mapLegalChangeImpact(card.legalChangeImpact),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/dashboard/stats');
}

export async function getDashboardKanban(): Promise<KanbanColumns> {
  const { columns } = await request<ApiKanbanResponse>('/dashboard/kanban');

  return PHASES.reduce<KanbanColumns>((acc, phase) => {
    acc[phase.id] = (columns[phase.id] ?? []).map(mapKanbanCard);
    return acc;
  }, {} as KanbanColumns);
}
