import type { DossierStatus, RiskLevel } from '../types/dossier';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: DossierStatus;
}

interface RiskBadgeProps {
  riskLevel: RiskLevel;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge--status-${status}`}>{status}</span>;
}

export function RiskBadge({ riskLevel }: RiskBadgeProps) {
  return <span className={`badge badge--risk-${riskLevel}`}>{riskLevel} risk</span>;
}
