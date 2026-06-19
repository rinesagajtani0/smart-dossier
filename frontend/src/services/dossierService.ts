import type { Dossier, DossierEvent, DossierSource, DossierStatus } from '../types/dossier';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

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

function mapStatus(status: string): DossierStatus {
  if (status === 'open') return 'active';
  if (status === 'closed') return 'archived';
  return 'draft';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'not set';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
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
    status: mapStatus(dossier.status),
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
    events: mapEvents(dossier),
    sources: mapSources(dossier),
  };
}

export async function getDossiers(): Promise<Dossier[]> {
  const dossiers = await request<ApiDossier[]>('/dossiers');
  return dossiers.map(mapDossier);
}

export async function getDossierById(id: string): Promise<Dossier | undefined> {
  const dossier = await request<ApiDossier>(`/dossiers/${id}`);
  return mapDossier(dossier);
}
