import { RiskLevelBadge } from './RiskLevelBadge';
import { useAffectedDossierDetails } from '../hooks/useAffectedDossierDetails';
import type { DossierRequiringReview } from '../services/legalImpactService';
import './AffectedDossiersPanel.css';

interface AffectedDossiersPanelProps {
  dossiers: DossierRequiringReview[];
  addedRequiredDocuments: string[];
}

function statusBadgeTone(statusBadge: string): string {
  if (statusBadge === 'Legal Update Required') return 'legal';
  if (statusBadge === 'High Risk') return 'high';
  return 'review';
}

export function AffectedDossiersPanel({ dossiers, addedRequiredDocuments }: AffectedDossiersPanelProps) {
  const { rows, loading } = useAffectedDossierDetails(dossiers, addedRequiredDocuments);

  if (dossiers.length === 0) {
    return <p className="affected-dossiers-panel__empty">No open dossiers currently sit in an affected phase.</p>;
  }

  if (loading && rows.length === 0) {
    return <p className="affected-dossiers-panel__empty">Loading dossier details…</p>;
  }

  return (
    <ul className="affected-dossiers-panel">
      {rows.map((row) => (
        <li key={row.id} className="affected-dossiers-panel__row">
          <span className="affected-dossiers-panel__code">{row.trackingCode}</span>
          <span className="affected-dossiers-panel__phase">{row.phase}</span>
          <RiskLevelBadge riskLevel={row.riskLevel} />
          <span className={`affected-dossiers-panel__status affected-dossiers-panel__status--${statusBadgeTone(row.statusBadge)}`}>
            {row.statusBadge}
          </span>
        </li>
      ))}
    </ul>
  );
}
