import type { LegalImpactGraphResult } from '../services/legalImpactService';
import { RiskLevelBadge } from './RiskLevelBadge';
import { StatCard } from './StatCard';
import { LegalImpactPropagationPath } from './LegalImpactPropagationPath';
import './LegalImpactPanel.css';

interface LegalImpactPanelProps {
  impact: LegalImpactGraphResult;
}

const SCORE_TONE: Record<LegalImpactGraphResult['severity'], 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

export function LegalImpactPanel({ impact }: LegalImpactPanelProps) {
  if (!impact.legalChangeApplies) {
    return (
      <div className="legal-impact-panel">
        <p className="legal-impact-panel__none">
          No legal change impact detected for this dossier's current phase.
        </p>
      </div>
    );
  }

  return (
    <div className="legal-impact-panel">
      <div className="legal-impact-panel__header">
        <h2>Legal Impact</h2>
        <RiskLevelBadge riskLevel={impact.severity} />
      </div>

      <div className="legal-impact-panel__stats">
        <StatCard label="Affected Nodes" value={impact.affectedNodes.length} />
        <StatCard label="Affected Dossiers" value={impact.affectedDossiers} tone="warning" />
        <StatCard label="Impact Score" value={impact.impactScore} tone={SCORE_TONE[impact.severity]} />
      </div>

      <div className="legal-impact-panel__section">
        <h3>Propagation Path</h3>
        <LegalImpactPropagationPath affectedNodes={impact.affectedNodes} />
      </div>

      <div className="legal-impact-panel__section">
        <h3>Affected Transitions</h3>
        {impact.affectedTransitions.length === 0 ? (
          <p className="legal-impact-panel__empty">No downstream transitions are affected.</p>
        ) : (
          <ul className="legal-impact-panel__transitions">
            {impact.affectedTransitions.map((transition) => (
              <li key={transition}>{transition}</li>
            ))}
          </ul>
        )}
      </div>

      {(impact.changedFields.length > 0 || impact.addedRequiredDocuments.length > 0) && (
        <div className="legal-impact-panel__details-grid">
          {impact.changedFields.length > 0 && (
            <div>
              <span className="legal-impact-panel__label">Changed Fields</span>
              <p>{impact.changedFields.join(', ')}</p>
            </div>
          )}
          {impact.addedRequiredDocuments.length > 0 && (
            <div>
              <span className="legal-impact-panel__label">Added Required Documents</span>
              <p>{impact.addedRequiredDocuments.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      <div className="legal-impact-panel__recommended">
        <span className="legal-impact-panel__label">Recommended Action</span>
        <p>{impact.recommendedAction}</p>
      </div>
    </div>
  );
}
