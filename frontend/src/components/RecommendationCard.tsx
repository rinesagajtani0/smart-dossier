import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { PreventionTaskStatus } from '../hooks/usePreventionEngine';
import './RecommendationCard.css';

export type RecommendationSeverity = 'high' | 'medium' | 'low';

interface RecommendationCardProps {
  title: string;
  severity: RecommendationSeverity;
  action: string;
  impact: string;
  riskImpactPercent: number;
  status: PreventionTaskStatus;
  resolving: boolean;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  delay?: number;
  // Citizens see the same recommendation detail but can't action it
  // themselves — that's a staff/manager operation. See PreventDelayPage.
  readOnly?: boolean;
}

const SEVERITY_ICON: Record<RecommendationSeverity, string> = {
  high: '⚠',
  medium: '⚡',
  low: '✓',
};

const SEVERITY_LABEL: Record<RecommendationSeverity, string> = {
  high: 'High Severity',
  medium: 'Medium Severity',
  low: 'Low Severity',
};

const STATUS_LABEL: Record<PreventionTaskStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export function RecommendationCard({
  title,
  severity,
  action,
  impact,
  riskImpactPercent,
  status,
  resolving,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  delay = 0,
  readOnly = false,
}: RecommendationCardProps) {
  const [open, setOpen] = useState(false);
  const isCompleted = status === 'completed';

  return (
    <div
      className={`recommendation-card recommendation-card--${severity}${isCompleted ? ' recommendation-card--completed' : ''}`}
      style={{ '--entrance-delay': `${delay}ms` } as CSSProperties}
    >
      <button
        type="button"
        className="recommendation-card__header"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={`recommendation-card__icon recommendation-card__icon--${severity}`} aria-hidden="true">
          {isCompleted ? '✓' : SEVERITY_ICON[severity]}
        </span>

        <div className="recommendation-card__heading">
          <span className="recommendation-card__title">{title}</span>
          <div className="recommendation-card__badge-row">
            <span className={`recommendation-card__badge recommendation-card__badge--${severity}`}>
              <span aria-hidden="true">{SEVERITY_ICON[severity]}</span> {SEVERITY_LABEL[severity]}
            </span>
            <span className={`recommendation-card__status recommendation-card__status--${status}`}>
              <span className="recommendation-card__status-dot" aria-hidden="true" />
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        <span
          className={`recommendation-card__chevron${open ? ' recommendation-card__chevron--open' : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div className={`recommendation-card__collapse${open ? ' recommendation-card__collapse--open' : ''}`}>
        <div className="recommendation-card__detail">
          <p className="recommendation-card__action">
            <span className="recommendation-card__detail-label">Recommended Action</span>
            {action}
          </p>
          <p className="recommendation-card__impact">
            <span className="recommendation-card__detail-label">Prevention Impact</span>
            {impact}
          </p>

          <div className="recommendation-card__analysis">
            <div className="recommendation-card__analysis-item">
              <span className="recommendation-card__detail-label">Risk Impact</span>
              <span className="recommendation-card__analysis-value recommendation-card__analysis-value--up">
                +{riskImpactPercent}% delay probability
              </span>
            </div>
            <div className="recommendation-card__analysis-item">
              <span className="recommendation-card__detail-label">Expected Improvement</span>
              <span className="recommendation-card__analysis-value recommendation-card__analysis-value--down">
                −{riskImpactPercent}% delay probability
              </span>
            </div>
          </div>

          {isCompleted ? (
            <p className="recommendation-card__resolved">✓ Action completed — delay risk recalculated.</p>
          ) : readOnly ? (
            <p className="recommendation-card__readonly-note">
              <span aria-hidden="true">👁</span> View only — staff will action this recommendation.
            </p>
          ) : (
            <div className="recommendation-card__actions">
              <button
                type="button"
                className="recommendation-card__action-button recommendation-card__action-button--primary"
                onClick={onPrimaryAction}
                disabled={resolving}
              >
                {resolving ? (
                  <>
                    <span className="recommendation-card__spinner" aria-hidden="true" /> Processing…
                  </>
                ) : (
                  primaryActionLabel
                )}
              </button>
              <button
                type="button"
                className="recommendation-card__action-button recommendation-card__action-button--secondary"
                onClick={onSecondaryAction}
                disabled={resolving}
              >
                {secondaryActionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
