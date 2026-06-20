import type { DelayPrediction } from '../services/dossierService';
import type { RiskLevel } from '../types/dossier';
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

export function DelayPredictionPanel({ prediction }: DelayPredictionPanelProps) {
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
    </div>
  );
}
