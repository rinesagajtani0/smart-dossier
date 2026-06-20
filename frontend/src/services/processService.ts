import { request } from './apiClient';
import { createDossier } from './dossierService';

export interface LegalUpdate {
  id: string;
  title: string;
  effectiveDate: string;
  reason: string;
  source: string;
  newRequiredDocuments: string[];
  changedFields: string[];
}

export interface ProcessStep {
  id: number;
  processType: string;
  phase: string;
  institution: string;
  criticalPoint: boolean;
  expectedDays: number;
  nextPhase: string | null;
  requiredDocuments: string[];
  legalChangeApplies: boolean;
  legalUpdates: LegalUpdate[];
  changedFields: string[];
  addedRequiredDocuments: string[];
}

interface ApiProcessStep {
  id: number;
  processType: string;
  phase: string;
  institution: string;
  criticalPoint: boolean;
  expectedDays: number;
  nextPhase: string | null;
  requiredDocuments: string[];
  requiredDocumentsJson?: string;
  legalChangeApplies?: boolean;
  legalUpdates?: LegalUpdate[];
  changedFields?: string[];
  addedRequiredDocuments?: string[];
}

export async function getProcessSteps(processType: string): Promise<ProcessStep[]> {
  const steps = await request<ApiProcessStep[]>(`/process/${processType}`);
  return steps.map((step) => ({
    id: step.id,
    processType: step.processType,
    phase: step.phase,
    institution: step.institution,
    criticalPoint: step.criticalPoint,
    expectedDays: step.expectedDays,
    nextPhase: step.nextPhase,
    requiredDocuments: step.requiredDocuments,
    legalChangeApplies: step.legalChangeApplies ?? false,
    legalUpdates: step.legalUpdates ?? [],
    changedFields: step.changedFields ?? [],
    addedRequiredDocuments: step.addedRequiredDocuments ?? [],
  }));
}

// --- Procedure Generator -------------------------------------------------
// Built on top of GET /process/:processType, the only backend capability
// that maps to "generating a procedure" today. requiredDocuments,
// institutions, and expectedTimeline are derived from real ProcessStep
// data. relevantRules and risks have no backend source yet (the schema has
// no rules/risk concept for a process type) — they're derived client-side
// from each step's criticalPoint/requiredDocuments so the same function
// signature can be backed by a real endpoint later without changing callers.

export interface ProcedureGeneratorInput {
  userIntent: string;
  municipality: string;
  propertyType: string;
}

export interface GeneratedProcedure {
  procedureName: string;
  processType: string;
  municipality: string;
  propertyType: string;
  requiredDocuments: string[];
  institutions: string[];
  expectedTimeline: string;
  relevantRules: string[];
  risks: string[];
  steps: ProcessStep[];
}

interface IntentMapping {
  id: string;
  label: string;
  processType: string;
}

// Only one processType exists in the seeded backend today. Add more
// entries here as the backend grows additional process types.
export const INTENT_MAPPINGS: IntentMapping[] = [
  { id: 'register-property', label: 'Property Ownership Registration', processType: 'property-registration' },
];

function resolveIntent(userIntent: string): IntentMapping {
  return INTENT_MAPPINGS.find((mapping) => mapping.id === userIntent) ?? INTENT_MAPPINGS[0];
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function formatTimeline(totalDays: number): string {
  return `~${totalDays} business day${totalDays === 1 ? '' : 's'}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// --- Citizen-facing required documents -----------------------------------
// Process-step data mixes paperwork the citizen must bring (identity
// document, ownership proof...) with internal verification artifacts the
// institutions produce themselves (legal verification, market analysis,
// final certificate, and whatever new compliance paperwork the legal-update
// engine injects over time, e.g. "valuation methodology note"). Rather than
// chase every internal term with a blocklist, this is an allow-list: a raw
// document is only surfaced if it positively matches one of a handful of
// plain-language citizen groups. Anything that doesn't match — internal or
// not — is dropped, which keeps the list both short and safe by default.
const CITIZEN_DOCUMENT_GROUPS: { label: string; match: RegExp }[] = [
  { label: 'Identity Document', match: /identity/i },
  { label: 'Ownership Proof', match: /ownership/i },
  { label: 'Property Contract', match: /contract/i },
  { label: 'Cadastral Plan', match: /cadastral|boundary|survey/i },
  { label: 'Fee Payment Receipt', match: /fee|payment|receipt/i },
  { label: 'Application Form', match: /application/i },
];

const MAX_CITIZEN_DOCUMENTS = 5;

function toCitizenFacingDocuments(rawDocuments: string[]): string[] {
  const labels: string[] = [];

  for (const raw of rawDocuments) {
    const group = CITIZEN_DOCUMENT_GROUPS.find((candidate) => candidate.match.test(raw));
    if (!group || labels.includes(group.label)) continue;

    labels.push(group.label);
    if (labels.length >= MAX_CITIZEN_DOCUMENTS) break;
  }

  return labels;
}

export async function generateProcedure(input: ProcedureGeneratorInput): Promise<GeneratedProcedure> {
  const intent = resolveIntent(input.userIntent);
  const steps = await getProcessSteps(intent.processType);

  if (steps.length === 0) {
    throw new Error(`No procedure is defined yet for "${intent.label}".`);
  }

  const requiredDocuments = toCitizenFacingDocuments(dedupe(steps.flatMap((step) => step.requiredDocuments)));
  const institutions = dedupe(steps.map((step) => step.institution));
  const totalDays = steps.reduce((sum, step) => sum + step.expectedDays, 0);
  const criticalSteps = steps.filter((step) => step.criticalPoint);

  const propertyType = input.propertyType.trim();
  const municipality = input.municipality.trim();
  const procedureName = [
    propertyType ? capitalize(propertyType) : null,
    intent.label,
    municipality ? `— ${municipality}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    procedureName,
    processType: intent.processType,
    municipality,
    propertyType,
    requiredDocuments,
    institutions,
    expectedTimeline: formatTimeline(totalDays),
    relevantRules: criticalSteps.map(
      (step) => `${step.phase} at ${step.institution} is a mandatory critical checkpoint and cannot be skipped.`,
    ),
    risks: criticalSteps.map(
      (step) => `Missing ${step.requiredDocuments.join(' or ')} during ${step.phase} is a common source of delay.`,
    ),
    steps,
  };
}

// --- Hand off to Document Upload ------------------------------------------
// "Upload Required Documents" on the result panel needs a real dossier to
// attach files to. This creates one from the generated procedure (so the
// dossier already knows its process type, location, property type, and
// which documents are outstanding) and returns the auto-generated id the
// Document Upload page should use.
export async function prepareDossierForProcedure(procedure: GeneratedProcedure): Promise<string> {
  const dossier = await createDossier({
    title: procedure.procedureName,
    processType: procedure.processType,
    propertyLocation: procedure.municipality || undefined,
    propertyType: procedure.propertyType || undefined,
    missingFields: procedure.requiredDocuments,
  });
  return dossier.id;
}

const PROCEDURE_SESSION_KEY = 'smart-dossier:procedure-session';

export interface ProcedureSession {
  dossierId: string;
  procedure: GeneratedProcedure;
  requiredDocuments: string[];
}

export function saveProcedureSession(session: ProcedureSession): void {
  window.sessionStorage.setItem(PROCEDURE_SESSION_KEY, JSON.stringify(session));
}

export function getProcedureSession(): ProcedureSession | null {
  const raw = window.sessionStorage.getItem(PROCEDURE_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ProcedureSession;
  } catch {
    return null;
  }
}
