import type { Phase } from '../types/dossier';

export interface PhaseConfig {
  id: Phase;
  label: string;
}

export const PHASES: PhaseConfig[] = [
  { id: 'Intake', label: 'Intake' },
  { id: 'ASHK Check', label: 'ASHK Check' },
  { id: 'Property Valuation', label: 'Property Valuation' },
  { id: 'Legal Review', label: 'Legal Review' },
  { id: 'Final Approval', label: 'Final Approval' },
];
