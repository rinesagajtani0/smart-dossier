import type { CaseStatus, Dossier, DossierEvent, DossierSource, Phase, RiskLevel } from '../types/dossier';
import { mapCaseStatus, mapPhase } from '../utils/phase';
import { patchJson, postJson, postMultipartWithProgress, request } from './apiClient';
import type { ExtractedDocumentData } from './nlpService';

interface ApiDocument {
  id: number;
  fileName: string;
  documentType?: string | null;
  uploadedAt: string;
}

interface ApiDossier {
  id: number;
  title: string;
  processType: string;
  applicantName?: string | null;
  ownerName?: string | null;
  propertyLocation?: string | null;
  propertyNumber?: string | null;
  cadastralZone?: string | null;
  propertyType?: string | null;
  phase: string;
  institution: string;
  status: string;
  deadline?: string | null;
  missingFields?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  documents?: ApiDocument[];
  caseHistory?: {
    outcome: string;
    delayDays: number;
    delayReason?: string | null;
    totalDurationDays: number;
  } | null;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'not set';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

function mapEvents(dossier: ApiDossier): DossierEvent[] {
  const events: DossierEvent[] = [
    {
      id: `${dossier.id}-created`,
      date: formatDate(dossier.createdAt),
      description: `Dossier opened in ${dossier.phase} at ${dossier.institution}.`,
    },
  ];

  if (dossier.caseHistory) {
    events.push({
      id: `${dossier.id}-history`,
      date: formatDate(dossier.updatedAt),
      description:
        dossier.caseHistory.outcome === 'delayed'
          ? `Historical outcome: delayed by ${dossier.caseHistory.delayDays} days (${dossier.caseHistory.delayReason ?? 'reason unavailable'}).`
          : `Historical outcome: ${dossier.caseHistory.outcome}.`,
    });
  }

  if (dossier.deadline) {
    events.push({
      id: `${dossier.id}-deadline`,
      date: formatDate(dossier.deadline),
      description: 'Current deadline for this process step.',
    });
  }

  return events;
}

function mapSources(dossier: ApiDossier): DossierSource[] {
  return (dossier.documents ?? []).map((document) => ({
    id: String(document.id),
    label: `${document.fileName}${document.documentType ? ` (${document.documentType})` : ''}`,
  }));
}

function mapDossier(dossier: ApiDossier): Dossier {
  const missingFields = dossier.missingFields ?? [];
  const tags = [
    dossier.phase,
    dossier.institution,
    dossier.propertyLocation,
    dossier.propertyType,
    ...missingFields,
  ].filter(Boolean) as string[];

  return {
    id: String(dossier.id),
    subject: dossier.title,
    category: `${dossier.processType} / ${dossier.phase}`,
    phase: mapPhase(dossier.phase),
    status: mapCaseStatus(dossier.status),
    riskLevel: dossier.riskLevel,
    summary:
      `${dossier.applicantName ?? 'Unknown applicant'} - ${dossier.propertyLocation ?? 'unknown location'}. ` +
      `Property ${dossier.propertyNumber ?? 'number missing'}, cadastral zone ${dossier.cadastralZone ?? 'missing'}. ` +
      (missingFields.length
        ? `Missing: ${missingFields.join(', ')}.`
        : 'No missing fields detected.'),
    tags,
    createdAt: formatDate(dossier.createdAt),
    updatedAt: formatDate(dossier.updatedAt),
    deadline: dossier.deadline ?? '',
    events: mapEvents(dossier),
    sources: mapSources(dossier),
  };
}

export async function getDossierById(id: string): Promise<Dossier | undefined> {
  const dossier = await request<ApiDossier>(`/dossiers/${id}`);
  return mapDossier(dossier);
}

export async function getDossiers(): Promise<Dossier[]> {
  const dossiers = await request<ApiDossier[]>('/dossiers');
  return dossiers.map(mapDossier);
}

export interface CreateDossierInput {
  title: string;
  processType?: string;
  applicantName?: string;
  ownerName?: string;
  propertyLocation?: string;
  propertyNumber?: string;
  cadastralZone?: string;
  propertyType?: string;
  phase?: Phase;
  institution?: string;
  status?: CaseStatus;
  deadline?: string;
  missingFields?: string[];
  riskLevel?: RiskLevel;
}

export type UpdateDossierInput = Partial<CreateDossierInput>;

export async function createDossier(input: CreateDossierInput): Promise<Dossier> {
  const dossier = await postJson<ApiDossier>('/dossiers', input);
  return mapDossier(dossier);
}

export async function updateDossier(id: string, patch: UpdateDossierInput): Promise<Dossier> {
  const dossier = await patchJson<ApiDossier>(`/dossiers/${id}`, patch);
  return mapDossier(dossier);
}

export interface UploadedDocumentResult {
  id: number;
  dossierId: number;
  fileName: string;
  documentType: string;
  extractedText: string;
  extractedDataJson: string;
  uploadedAt: string;
  extractedData: ExtractedDocumentData;
}

export async function uploadDossierDocument(
  id: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadedDocumentResult> {
  const formData = new FormData();
  formData.append('file', file);
  return postMultipartWithProgress<UploadedDocumentResult>(`/dossiers/${id}/documents`, formData, onProgress);
}

interface ApiSimilarDossier extends ApiDossier {
  similarity: {
    score: number;
    reasons: string[];
  };
}

export interface SimilarDossierMatch {
  dossier: Dossier;
  score: number;
  reasons: string[];
}

export async function getSimilarDossiers(id: string): Promise<SimilarDossierMatch[]> {
  const matches = await request<ApiSimilarDossier[]>(`/dossiers/${id}/similar`);
  return matches.map((match) => ({
    dossier: mapDossier(match),
    score: match.similarity.score,
    reasons: match.similarity.reasons,
  }));
}

// --- Case Memory -----------------------------------------------------------
// Same /dossiers/:id/similar endpoint as getSimilarDossiers above, but
// projected to the lean shape the Case Memory panel needs (case id, score,
// outcome, delay reason) instead of the full mapped Dossier.

interface ApiCaseMemoryMatch {
  trackingCode: string;
  similarity: { score: number; reasons: string[] };
  caseHistory?: { outcome: string; delayReason?: string | null } | null;
}

export interface SimilarCase {
  caseId: string;
  score: number;
  outcome: string | null;
  delayReason: string | null;
}

export async function getCaseMemory(id: string): Promise<SimilarCase[]> {
  const matches = await request<ApiCaseMemoryMatch[]>(`/dossiers/${id}/similar`);
  return matches.map((match) => ({
    caseId: match.trackingCode,
    score: match.similarity.score,
    outcome: match.caseHistory?.outcome ?? null,
    delayReason: match.caseHistory?.delayReason ?? null,
  }));
}

export interface DelayPrediction {
  risk: RiskLevel;
  predictedDelay: string;
  likelyBlockage: string;
  reason: string;
  recommendedAction: string;
}

export async function predictDossierDelay(id: string): Promise<DelayPrediction> {
  return request<DelayPrediction>(`/dossiers/${id}/predict-delay`);
}

export interface GeneratedLetter {
  id: number;
  dossierId: number;
  type: string;
  content: string;
  createdAt: string;
}

export async function generateDossierLetter(id: string, type?: string): Promise<GeneratedLetter> {
  return postJson<GeneratedLetter>(`/dossiers/${id}/generate-letter`, { type });
}
