import type { RiskLevel } from '../types/dossier';
import { RiskLevelBadge } from './RiskLevelBadge';
import './RiskTransition.css';

interface RiskTransitionProps {
  currentRisk: RiskLevel;
  updatedRisk: RiskLevel;
}

export function RiskTransition({ currentRisk, updatedRisk }: RiskTransitionProps) {
  const improved = currentRisk !== updatedRisk;

  return (
    <div className="risk-transition">
      <div className="risk-transition__side">
        <span className="risk-transition__label">Current Risk</span>
        <RiskLevelBadge riskLevel={currentRisk} />
      </div>

      <span className={`risk-transition__arrow ${improved ? 'risk-transition__arrow--improved' : ''}`} aria-hidden="true">
        →
      </span>

      <div className="risk-transition__side">
        <span className="risk-transition__label">Updated Risk</span>
        <RiskLevelBadge riskLevel={updatedRisk} />
      </div>

      {improved && <span className="risk-transition__badge">↓ Risk reduced</span>}
    </div>
  );
}
