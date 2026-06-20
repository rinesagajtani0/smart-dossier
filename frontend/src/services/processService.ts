import { request } from './apiClient';

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
  legalUpdates: string[];
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
  legalUpdates?: string[];
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

export async function generateProcedure(input: ProcedureGeneratorInput): Promise<GeneratedProcedure> {
  const intent = resolveIntent(input.userIntent);
  const steps = await getProcessSteps(intent.processType);

  if (steps.length === 0) {
    throw new Error(`No procedure is defined yet for "${intent.label}".`);
  }

  const requiredDocuments = dedupe(steps.flatMap((step) => step.requiredDocuments));
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
