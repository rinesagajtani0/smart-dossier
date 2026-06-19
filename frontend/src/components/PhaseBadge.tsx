import type { Phase, RiskLevel } from '../types/dossier';
import './PhaseBadge.css';

interface PhaseBadgeProps {
  phase: Phase;
}

interface RiskBadgeProps {
  riskLevel: RiskLevel;
}

const PHASE_LABELS: Record<Phase, string> = {
  submitted: 'Submitted',
  verification: 'Verification',
  valuation: 'Valuation',
  approval: 'Approval',
  completed: 'Completed',
};

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return <span className={`badge badge--phase-${phase}`}>{PHASE_LABELS[phase]}</span>;
}

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  return <span className={`badge badge--risk-${riskLevel}`}>{riskLevel} risk</span>;
}
