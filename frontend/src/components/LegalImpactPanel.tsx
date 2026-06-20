import type { LegalImpactGraphResult } from '../services/legalImpactService';
import { LegalImpactRiskBadge } from './LegalImpactRiskBadge';
import { StatCard } from './StatCard';
import { LegalImpactPropagationPath } from './LegalImpactPropagationPath';
import { AffectedDossiersPanel } from './AffectedDossiersPanel';
import { WhyImpactfulCard } from './WhyImpactfulCard';
import { ImmediateActionsPanel } from './ImmediateActionsPanel';
import { AdministrativeImpactCard } from './AdministrativeImpactCard';
import { riskTierFromScore } from '../utils/legalImpactRisk';
import './LegalImpactPanel.css';

interface LegalImpactPanelProps {
  impact: LegalImpactGraphResult;
}

const SCORE_TONE: Record<ReturnType<typeof riskTierFromScore>, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export function LegalImpactPanel({ impact }: LegalImpactPanelProps) {
  if (!impact.legalChangeApplies) {
    return (
      <div className="legal-impact-panel">
        <p className="legal-impact-panel__none">
          "{impact.legalChangeTitle}" has no impact on any dossier's current phase.
        </p>
      </div>
    );
  }

  return (
    <div className="legal-impact-panel">
      <div className="legal-impact-panel__header">
        <div>
          <h2>Legal Impact</h2>
          <p className="legal-impact-panel__subtitle">{impact.legalChangeTitle}</p>
        </div>
        <LegalImpactRiskBadge score={impact.impactScore} />
      </div>

      <div className="legal-impact-panel__stats">
        <StatCard label="Affected Nodes" value={impact.affectedNodes.length} />
        <StatCard label="Affected Dossiers" value={impact.affectedDossiers} tone="warning" />
        <StatCard label="Impact Score" value={impact.impactScore} tone={SCORE_TONE[riskTierFromScore(impact.impactScore)]} />
      </div>

      <AdministrativeImpactCard impact={impact} />

      <WhyImpactfulCard impact={impact} />

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

      <div className="legal-impact-panel__section">
        <h3>Affected Dossiers</h3>
        <AffectedDossiersPanel
          dossiers={impact.dossiersRequiringReview}
          addedRequiredDocuments={impact.addedRequiredDocuments}
        />
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

      <ImmediateActionsPanel impact={impact} />
    </div>
  );
}
