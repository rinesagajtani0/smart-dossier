import { riskTierFromScore } from '../utils/legalImpactRisk';
import './LegalImpactRiskBadge.css';

interface LegalImpactRiskBadgeProps {
  score: number;
}

const RISK_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function LegalImpactRiskBadge({ score }: LegalImpactRiskBadgeProps) {
  const tier = riskTierFromScore(score);

  return (
    <span className={`legal-impact-risk-badge legal-impact-risk-badge--${tier}`}>
      <span className="legal-impact-risk-badge__dot" aria-hidden="true" />
      {RISK_LABELS[tier]} Risk
    </span>
  );
}
