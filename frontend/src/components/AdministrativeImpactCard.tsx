import { useActiveDossierCount } from '../hooks/useActiveDossierCount';
import type { LegalImpactGraphResult } from '../services/legalImpactService';
import './AdministrativeImpactCard.css';

interface AdministrativeImpactCardProps {
  impact: LegalImpactGraphResult;
}

// No real time-tracking data exists for review effort yet, so this is a
// reasonable estimate derived from affected dossier count (2 hours per
// dossier for re-checking documents and recalculating deadlines) rather
// than a precise measurement.
const ESTIMATED_HOURS_PER_DOSSIER = 2;

export function AdministrativeImpactCard({ impact }: AdministrativeImpactCardProps) {
  const activeDossierCount = useActiveDossierCount();
  const estimatedHours = impact.affectedDossiers * ESTIMATED_HOURS_PER_DOSSIER;
  const affectedPercentage =
    activeDossierCount && activeDossierCount > 0
      ? Math.round((impact.affectedDossiers / activeDossierCount) * 1000) / 10
      : null;

  return (
    <div className="administrative-impact-card">
      <h3>Administrative Impact</h3>
      <ul className="administrative-impact-card__list">
        <li>
          <strong>{impact.affectedDossiers}</strong> of <strong>{activeDossierCount ?? '…'}</strong> active dossiers
        </li>
        {affectedPercentage !== null && (
          <li>
            <strong>{affectedPercentage}%</strong> affected
          </li>
        )}
        <li>
          <strong>{impact.affectedNodes.length}</strong> affected workflow stage{impact.affectedNodes.length === 1 ? '' : 's'}
        </li>
        <li>
          Estimated review effort: <strong>{estimatedHours} hour{estimatedHours === 1 ? '' : 's'}</strong>
        </li>
      </ul>
    </div>
  );
}
