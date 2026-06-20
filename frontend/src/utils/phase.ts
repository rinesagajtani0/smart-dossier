import type { CaseStatus, Phase } from '../types/dossier';
import { PHASES } from '../data/phases';

const VALID_PHASES = PHASES.map((phase) => phase.id);

export function mapPhase(phase: string, fallback: Phase = 'Intake'): Phase {
  return (VALID_PHASES as string[]).includes(phase) ? (phase as Phase) : fallback;
}

export function mapCaseStatus(status: string): CaseStatus {
  return status === 'closed' ? 'closed' : 'open';
}

export function slugifyPhase(phase: Phase): string {
  return phase.toLowerCase().replace(/\s+/g, '-');
}

// Presentational labels for "bottleneck" reporting (Dashboard, Role Views)
// only — the underlying Phase values stay exactly as they are everywhere
// else (PhaseBadge, Kanban, etc.); this is just business-friendly wording
// for a manager audience. Intake is excluded — it isn't where dossiers
// actually stall.
export const BOTTLENECK_LABELS: Partial<Record<Phase, string>> = {
  'ASHK Check': 'Cadastral Verification',
  'Property Valuation': 'Property Valuation',
  'Legal Review': 'Legal Review',
  'Final Approval': 'Registration Approval',
};
