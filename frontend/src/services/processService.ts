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
// Generated deterministically from the citizen's intent, municipality, and
// property type — there is no static lookup table shared by every answer.
// Property type drives which documents apply and which workflow step makes
// the procedure simple/medium/complex; municipality drives the local
// institution name and a caseload-based timeline adjustment. Both axes
// change the result, so different selections produce different procedures
// instead of the same fixed template with a different title.

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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type Complexity = 'simple' | 'medium' | 'complex';

interface PropertyTypeProfile {
  complexity: Complexity;
  // Already citizen-facing (max 5, no internal/administrative documents) —
  // authored per property type instead of filtered out of a generic list.
  requiredDocuments: string[];
  // The one workflow step that's specific to this property type — the
  // reason an apartment procedure isn't shaped like a farmland procedure.
  extraStep: { phase: string; institution: string };
}

const PROPERTY_TYPE_PROFILES: Record<string, PropertyTypeProfile> = {
  apartament: {
    complexity: 'simple',
    requiredDocuments: ['Identity Document', 'Ownership Contract', 'Building Unit Documentation'],
    extraStep: { phase: 'Building Unit Verification', institution: 'ASHK' },
  },
  'shtëpi': {
    complexity: 'simple',
    requiredDocuments: ['Identity Document', 'Ownership Proof', 'Property Contract'],
    extraStep: { phase: 'Building Unit Verification', institution: 'ASHK' },
  },
  truall: {
    complexity: 'medium',
    requiredDocuments: ['Identity Document', 'Ownership Proof', 'Cadastral Plan'],
    extraStep: { phase: 'Cadastral Boundary Check', institution: 'ASHK' },
  },
  'tokë bujqësore': {
    complexity: 'complex',
    requiredDocuments: ['Identity Document', 'Ownership Proof', 'Agricultural Land Documentation'],
    extraStep: { phase: 'Agricultural Registry Check', institution: 'Agricultural Land Registry' },
  },
  'vilë': {
    complexity: 'medium',
    requiredDocuments: [
      'Identity Document',
      'Ownership Contract',
      'Building Unit Documentation',
      'Construction Permit',
    ],
    extraStep: { phase: 'Building Unit Verification', institution: 'ASHK' },
  },
  'lokal komercial': {
    complexity: 'medium',
    requiredDocuments: ['Identity Document', 'Ownership Contract', 'Business Registration Certificate'],
    extraStep: { phase: 'Business License Cross-Check', institution: 'National Business Center' },
  },
};

const DEFAULT_PROPERTY_PROFILE = PROPERTY_TYPE_PROFILES.apartament;

function resolvePropertyProfile(propertyType: string): PropertyTypeProfile {
  return PROPERTY_TYPE_PROFILES[propertyType.trim().toLowerCase()] ?? DEFAULT_PROPERTY_PROFILE;
}

// Larger municipalities carry a heavier dossier backlog, which pushes the
// timeline out — the other axis that makes "Tiranë" different from
// "Durrës" even for the same property type.
const MUNICIPALITY_LOAD_DAYS: Record<string, number> = {
  'tiranë': 4,
  'durrës': 3,
  'vlorë': 2,
  'shkodër': 2,
  elbasan: 2,
  fier: 2,
  'korçë': 1,
  berat: 1,
  'lezhë': 1,
  'kukës': 1,
  'dibër': 1,
  'gjirokastër': 1,
};

function resolveMunicipalityLoad(municipality: string): number {
  return MUNICIPALITY_LOAD_DAYS[municipality.trim().toLowerCase()] ?? 0;
}

const COMPLEXITY_RANGES: Record<Complexity, [number, number]> = {
  simple: [5, 10],
  medium: [10, 20],
  complex: [20, 30],
};

// Day weights for the 5 workflow steps below (intake, ownership check, the
// property-specific step, valuation, final registration). The
// property-specific step gets the largest share since it's what makes the
// procedure simple or complex in the first place.
const STEP_DAY_WEIGHTS = [0.15, 0.2, 0.3, 0.2, 0.15];

function splitDays(totalDays: number): number[] {
  const days = STEP_DAY_WEIGHTS.map((weight) => Math.max(1, Math.round(totalDays * weight)));
  days[days.length - 1] += totalDays - days.reduce((sum, value) => sum + value, 0);
  return days;
}

function buildSteps(profile: PropertyTypeProfile, municipalityLabel: string, totalDays: number): ProcessStep[] {
  const [intakeDays, ownershipDays, extraDays, valuationDays, finalDays] = splitDays(totalDays);

  const phases = [
    { phase: 'Intake', institution: municipalityLabel, expectedDays: intakeDays },
    { phase: 'Ownership Verification', institution: 'ASHK', expectedDays: ownershipDays },
    { phase: profile.extraStep.phase, institution: profile.extraStep.institution, expectedDays: extraDays },
    { phase: 'Property Valuation', institution: 'Valuation Office', expectedDays: valuationDays },
    { phase: 'Final Registration', institution: municipalityLabel, expectedDays: finalDays },
  ];

  return phases.map((step, index) => ({
    id: index + 1,
    processType: 'property-registration',
    phase: step.phase,
    institution: step.institution,
    criticalPoint: false,
    expectedDays: step.expectedDays,
    nextPhase: phases[index + 1]?.phase ?? null,
    requiredDocuments: [],
    legalChangeApplies: false,
    legalUpdates: [],
    changedFields: [],
    addedRequiredDocuments: [],
  }));
}

export async function generateProcedure(input: ProcedureGeneratorInput): Promise<GeneratedProcedure> {
  const intent = resolveIntent(input.userIntent);
  const propertyType = input.propertyType.trim();
  const municipality = input.municipality.trim();

  const profile = resolvePropertyProfile(propertyType);
  const municipalityLoad = resolveMunicipalityLoad(municipality);
  const [baseLower, baseUpper] = COMPLEXITY_RANGES[profile.complexity];
  const lower = baseLower + municipalityLoad;
  const upper = baseUpper + municipalityLoad;

  const municipalityLabel = municipality ? `Bashkia ${municipality}` : 'Municipality';
  const steps = buildSteps(profile, municipalityLabel, lower);
  const institutions = dedupe(steps.map((step) => step.institution));

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
    requiredDocuments: profile.requiredDocuments.slice(0, 5),
    institutions,
    expectedTimeline: `${lower}-${upper} days`,
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
