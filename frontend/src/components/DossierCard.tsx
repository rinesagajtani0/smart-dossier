import { Link } from 'react-router-dom';
import type { Dossier } from '../types/dossier';
import { RiskBadge } from './PhaseBadge';
import { isDelayed } from '../utils/dossierStats';
import './DossierCard.css';

interface DossierCardProps {
  dossier: Dossier;
}

export function DossierCard({ dossier }: DossierCardProps) {
  const delayed = isDelayed(dossier);

  return (
    <Link to={`/dossiers/${dossier.id}`} className="dossier-card">
      <div className="dossier-card__header">
        <h4>{dossier.subject}</h4>
        <RiskBadge riskLevel={dossier.riskLevel} />
      </div>
      <p className="dossier-card__category">{dossier.category}</p>
      <p className="dossier-card__summary">{dossier.summary}</p>
      <div className="dossier-card__footer">
        <span className={delayed ? 'dossier-card__deadline dossier-card__deadline--delayed' : 'dossier-card__deadline'}>
          {delayed ? 'Overdue' : 'Due'} {dossier.deadline}
        </span>
      </div>
    </Link>
  );
}
