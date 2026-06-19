import type { Phase } from '../types/dossier';

export interface PhaseConfig {
  id: Phase;
  label: string;
}

export const PHASES: PhaseConfig[] = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'verification', label: 'Verification' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'approval', label: 'Approval' },
  { id: 'completed', label: 'Completed' },
];
