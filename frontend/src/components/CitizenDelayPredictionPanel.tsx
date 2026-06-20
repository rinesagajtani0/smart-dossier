import type { DelayPrediction } from '../services/dossierService';
import { useDossierSnapshot } from '../hooks/useDossierSnapshot';
import { RiskLevelBadge } from './RiskLevelBadge';
import './CitizenDelayPredictionPanel.css';

interface CitizenDelayPredictionPanelProps {
  dossierId: string;
  prediction: DelayPrediction;
}

export function CitizenDelayPredictionPanel({ dossierId, prediction }: CitizenDelayPredictionPanelProps) {
  const { snapshot, loading, error } = useDossierSnapshot(dossierId);

  return (
    <div className="citizen-delay-prediction-panel">
      <div className="citizen-delay-prediction-panel__header">
        <h2>Delay Outlook</h2>
        <RiskLevelBadge riskLevel={prediction.risk} />
      </div>

      <div className="citizen-delay-prediction-panel__section">
        <span className="citizen-delay-prediction-panel__label">Estimated Delay</span>
        <p>{prediction.predictedDelay}</p>
      </div>

      <div className="citizen-delay-prediction-panel__section">
        <span className="citizen-delay-prediction-panel__label">Missing Requirements</span>
        {loading && <p className="citizen-delay-prediction-panel__status">Checking your documents…</p>}
        {error && (
          <p className="citizen-delay-prediction-panel__status citizen-delay-prediction-panel__status--error">
            {error}
          </p>
        )}
        {!loading && !error && snapshot && (
          snapshot.missingFields.length > 0 ? (
            <ul className="citizen-delay-prediction-panel__list">
              {snapshot.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p className="citizen-delay-prediction-panel__empty">No missing requirements detected.</p>
          )
        )}
      </div>

      <div className="citizen-delay-prediction-panel__section">
        <span className="citizen-delay-prediction-panel__label">Recommended Actions</span>
        <p>{prediction.recommendedAction}</p>
      </div>
    </div>
  );
}
