import type { RiskLevel } from '../types/dossier';
import './RiskLevelBadge.css';

interface RiskLevelBadgeProps {
  riskLevel: RiskLevel;
  compact?: boolean;
}

const RISK_LABELS: Record<RiskLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function RiskLevelBadge({ riskLevel, compact = false }: RiskLevelBadgeProps) {
  return (
    <span
      className={`risk-level-badge risk-level-badge--${riskLevel}${compact ? ' risk-level-badge--compact' : ''}`}
    >
      <span className="risk-level-badge__dot" aria-hidden="true" />
      {RISK_LABELS[riskLevel]}{!compact && ' Risk'}
    </span>
  );
}
