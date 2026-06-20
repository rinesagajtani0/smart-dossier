import type { LegalImpactGraphResult } from '../services/legalImpactService';
import './ImmediateActionsPanel.css';

interface ImmediateActionsPanelProps {
  impact: LegalImpactGraphResult;
}

// The workflow is strictly ordered: a legal change goes to staff first —
// staff review the affected dossiers and decide what's needed — and only
// after that decision does anything go out to a citizen. Citizens are
// never notified directly from the legal change itself, so that step
// always comes last and is explicitly framed as happening "after review."
function buildImmediateActions(impact: LegalImpactGraphResult): string[] {
  const actions: string[] = [];

  actions.push('Notify responsible staff about the legal change.');

  actions.push(
    impact.affectedDossiers > 0
      ? `Review all ${impact.affectedDossiers} affected dossier${impact.affectedDossiers === 1 ? '' : 's'}.`
      : 'Review affected dossiers as new ones enter the affected phases.'
  );

  if (impact.addedRequiredDocuments.length > 0) {
    actions.push(`Verify which dossiers require additional documents: ${impact.addedRequiredDocuments.join(', ')}.`);
  }

  if (impact.changedFields.length > 0 || impact.severity === 'high') {
    actions.push('Recalculate deadlines if needed.');
  }

  actions.push(
    impact.addedRequiredDocuments.length > 0
      ? 'After review, notify affected citizens and request the required documents.'
      : 'After review, notify affected citizens of the updated requirements.'
  );

  return actions;
}

export function ImmediateActionsPanel({ impact }: ImmediateActionsPanelProps) {
  const actions = buildImmediateActions(impact);

  return (
    <div className="immediate-actions-panel">
      <h3>Immediate Actions</h3>
      <ol className="immediate-actions-panel__list">
        {actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ol>
    </div>
  );
}
