import type { Phase, RiskLevel } from '../types/dossier';
import { slugifyPhase } from '../utils/phase';
import './PhaseBadge.css';

interface PhaseBadgeProps {
  phase: Phase;
}

interface RiskBadgeProps {
  riskLevel: RiskLevel;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  return <span className={`badge badge--phase-${slugifyPhase(phase)}`}>{phase}</span>;
}

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  return <span className={`badge badge--risk-${riskLevel}`}>{riskLevel} risk</span>;
}
