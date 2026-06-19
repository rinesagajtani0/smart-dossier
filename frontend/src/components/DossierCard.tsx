import { Link } from 'react-router-dom';
import type { Dossier } from '../types/dossier';
import { RiskBadge, StatusBadge } from './StatusBadge';
import './DossierCard.css';

interface DossierCardProps {
  dossier: Dossier;
}

export function DossierCard({ dossier }: DossierCardProps) {
  return (
    <Link to={`/dossiers/${dossier.id}`} className="dossier-card">
      <div className="dossier-card__header">
        <h3>{dossier.subject}</h3>
        <StatusBadge status={dossier.status} />
      </div>
      <p className="dossier-card__category">{dossier.category}</p>
      <p className="dossier-card__summary">{dossier.summary}</p>
      <div className="dossier-card__footer">
        <RiskBadge riskLevel={dossier.riskLevel} />
        <span className="dossier-card__updated">Updated {dossier.updatedAt}</span>
      </div>
    </Link>
  );
}
