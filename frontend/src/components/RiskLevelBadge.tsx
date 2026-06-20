import type { RiskLevel } from '../types/dossier';
import './RiskLevelBadge.css';

interface RiskLevelBadgeProps {
  riskLevel: RiskLevel;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function RiskLevelBadge({ riskLevel }: RiskLevelBadgeProps) {
  return (
    <span className={`risk-level-badge risk-level-badge--${riskLevel}`}>
      <span className="risk-level-badge__dot" aria-hidden="true" />
      {RISK_LABELS[riskLevel]} Risk
    </span>
  );
}
