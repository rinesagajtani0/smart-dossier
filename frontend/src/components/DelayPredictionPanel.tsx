import { useState } from 'react';
import type { DelayPrediction } from '../services/dossierService';
import type { RiskLevel } from '../types/dossier';
import { usePermissions } from '../auth/usePermissions';
import { RiskLevelBadge } from './RiskLevelBadge';
import { WarningBanner } from './WarningBanner';
import { ProcedureResultSection } from './ProcedureResultSection';
import './DelayPredictionPanel.css';

interface DelayPredictionPanelProps {
  prediction: DelayPrediction;
}

const WARNING_MESSAGES: Partial<Record<RiskLevel, string>> = {
  high: 'High risk of delay — immediate action recommended.',
  medium: 'Some risk of delay — keep a close eye on this dossier.',
};

// This panel only ever renders for staff or manager (citizens get
// CitizenDelayPredictionPanel instead — see DelayPredictionPage), so the
// only distinction left to make here is staff vs. manager: staff
// investigates and reviews the risk, manager makes the call on intervention.
export function DelayPredictionPanel({ prediction }: DelayPredictionPanelProps) {
  const { can } = usePermissions();
  const isManager = can('view-manager-reports');
  const [primaryActionDone, setPrimaryActionDone] = useState(false);
  const [secondaryActionDone, setSecondaryActionDone] = useState(false);
  const warningMessage = WARNING_MESSAGES[prediction.risk];

  return (
    <div className={`delay-prediction-panel delay-prediction-panel--${prediction.risk}`}>
      {warningMessage && (
        <WarningBanner tone={prediction.risk === 'high' ? 'high' : 'medium'}>{warningMessage}</WarningBanner>
      )}

      <div className="delay-prediction-panel__header">
        <h2>Delay Prediction</h2>
        <RiskLevelBadge riskLevel={prediction.risk} />
      </div>

      <div className="delay-prediction-panel__grid">
        <ProcedureResultSection label="Predicted Delay">
          <p className="delay-prediction-panel__value">{prediction.predictedDelay}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Likely Blockage">
          <p className="delay-prediction-panel__value">{prediction.likelyBlockage}</p>
        </ProcedureResultSection>
      </div>

      <ProcedureResultSection label="Recommended Action">
        <p className="delay-prediction-panel__action">{prediction.recommendedAction}</p>
      </ProcedureResultSection>

      {prediction.legalChangeImpact && (
        <div className="delay-prediction-panel__legal" role="alert">
          <h3 className="delay-prediction-panel__legal-title">
            <span aria-hidden="true">⚖</span> Legal Change Impact
          </h3>
          <p className="delay-prediction-panel__legal-summary">{prediction.legalChangeImpact.summary}</p>

          <div className="delay-prediction-panel__legal-grid">
            <div>
              <span className="delay-prediction-panel__legal-label">Compliance Risk</span>
              <p>{prediction.legalChangeImpact.complianceRisk}</p>
            </div>
            <div>
              <span className="delay-prediction-panel__legal-label">Additional Delay Risk</span>
              <p>{prediction.legalChangeImpact.additionalDelayRisk}</p>
            </div>
          </div>

          <div className="delay-prediction-panel__legal-action">
            <span className="delay-prediction-panel__legal-label">Required Action</span>
            <p>{prediction.legalChangeImpact.requiredAction}</p>
          </div>
        </div>
      )}

      <div
        className={`delay-prediction-panel__role-actions delay-prediction-panel__role-actions--${isManager ? 'manager' : 'staff'}`}
      >
        <h3 className="delay-prediction-panel__role-actions-title">
          {isManager ? 'Manager Decision' : 'Staff Review'}
        </h3>
        <div className="delay-prediction-panel__role-actions-buttons">
          {isManager ? (
            <>
              <button
                type="button"
                className="delay-prediction-panel__action-button delay-prediction-panel__action-button--primary"
                onClick={() => setPrimaryActionDone(true)}
                disabled={primaryActionDone}
              >
                {primaryActionDone ? 'Intervention Approved' : 'Approve Intervention Plan'}
              </button>
              <button
                type="button"
                className="delay-prediction-panel__action-button delay-prediction-panel__action-button--secondary"
                onClick={() => setSecondaryActionDone(true)}
                disabled={secondaryActionDone}
              >
                {secondaryActionDone ? 'Escalated to Legal Review' : 'Escalate to Legal Review'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="delay-prediction-panel__action-button delay-prediction-panel__action-button--primary"
                onClick={() => setPrimaryActionDone(true)}
                disabled={primaryActionDone}
              >
                {primaryActionDone ? 'Risk Reviewed' : 'Mark Risk Reviewed'}
              </button>
              <button
                type="button"
                className="delay-prediction-panel__action-button delay-prediction-panel__action-button--secondary"
                onClick={() => setSecondaryActionDone(true)}
                disabled={secondaryActionDone}
              >
                {secondaryActionDone ? 'Flagged for Manager' : 'Flag for Manager Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
