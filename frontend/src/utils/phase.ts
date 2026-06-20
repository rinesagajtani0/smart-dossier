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
