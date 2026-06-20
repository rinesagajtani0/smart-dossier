import type { ProcessStep } from '../services/processService';
import './ProcessStepCard.css';

interface ProcessStepCardProps {
  step: ProcessStep;
}

export function ProcessStepCard({ step }: ProcessStepCardProps) {
  const requiresLegalReview = step.legalChangeApplies;

  return (
    <div className={`process-step-card${requiresLegalReview ? ' process-step-card--legal-review' : ''}`}>
      <div className="process-step-card__header">
        <h4 className="process-step-card__phase">{step.phase}</h4>
        <div className="process-step-card__badges">
          {step.criticalPoint && (
            <span className="process-step-card__badge process-step-card__badge--critical">Critical Checkpoint</span>
          )}
          {requiresLegalReview && (
            <span className="process-step-card__badge process-step-card__badge--legal-review">
              Critical Review Required
            </span>
          )}
        </div>
      </div>

      <p className="process-step-card__meta">
        {step.institution} · ~{step.expectedDays} day{step.expectedDays === 1 ? '' : 's'}
      </p>

      {step.requiredDocuments.length > 0 && (
        <p className="process-step-card__documents">Documents: {step.requiredDocuments.join(', ')}</p>
      )}

      {requiresLegalReview && (
        <div className="process-step-card__legal-notice" role="alert">
          <p className="process-step-card__legal-title">
            <span aria-hidden="true">⚖</span> Legal update affects this step
          </p>

          {step.legalUpdates.length > 0 && (
            <ul className="process-step-card__legal-list">
              {step.legalUpdates.map((update) => (
                <li key={update.id}>
                  {update.title}
                  {update.effectiveDate ? ` (effective ${update.effectiveDate})` : ''}
                </li>
              ))}
            </ul>
          )}

          {step.changedFields.length > 0 && (
            <p className="process-step-card__legal-sub">Fields requiring review: {step.changedFields.join(', ')}</p>
          )}

          {step.addedRequiredDocuments.length > 0 && (
            <p className="process-step-card__legal-sub">
              Newly required documents: {step.addedRequiredDocuments.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
