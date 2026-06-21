import { DelayRiskGauge } from './DelayRiskGauge';
import { RISK_PROBABILITY, parseUpperBoundDays } from '../utils/riskProbability';
import type { DelayPrediction } from '../services/dossierService';
import type { PreventionTask, PreventionTaskStatus } from '../hooks/usePreventionEngine';
import './RiskReductionSimulator.css';

interface RiskReductionSimulatorProps {
  baseline: DelayPrediction;
  live: DelayPrediction;
  tasks: PreventionTask[];
  statuses: Record<string, PreventionTaskStatus>;
}

export function RiskReductionSimulator({ baseline, live, tasks, statuses }: RiskReductionSimulatorProps) {
  const beforePercent = RISK_PROBABILITY[baseline.risk];
  const afterPercent = RISK_PROBABILITY[live.risk];
  const reduced = beforePercent - afterPercent;

  const beforeDays = parseUpperBoundDays(baseline.predictedDelay) ?? 0;
  const afterDays = parseUpperBoundDays(live.predictedDelay) ?? 0;
  const daysSaved = Math.max(0, beforeDays - afterDays);

  return (
    <div className="risk-reduction-simulator">
      <h2 className="risk-reduction-simulator__title">
        <span aria-hidden="true">🛡️</span> Risk Reduction Simulator
      </h2>

      <div className="risk-reduction-simulator__gauges">
        <div className="risk-reduction-simulator__gauge-block">
          <span className="risk-reduction-simulator__gauge-label">Current Delay Risk</span>
          <DelayRiskGauge percent={beforePercent} riskLevel={baseline.risk} />
        </div>

        <span className="risk-reduction-simulator__arrow" aria-hidden="true">
          →
        </span>

        <div className="risk-reduction-simulator__gauge-block">
          <span className="risk-reduction-simulator__gauge-label">Predicted Risk After Actions</span>
          <DelayRiskGauge percent={afterPercent} riskLevel={live.risk} />
        </div>
      </div>

      {reduced > 0 ? (
        <p className="risk-reduction-simulator__reduction">
          <span aria-hidden="true">↓</span> Risk reduced by <strong>{reduced}%</strong>
          {daysSaved > 0 && (
            <>
              {' '}
              · Expected Time Saved: <strong>{daysSaved} Days</strong>
            </>
          )}
        </p>
      ) : (
        <p className="risk-reduction-simulator__hint">Complete prevention actions below to reduce delay risk.</p>
      )}

      <div className="risk-reduction-simulator__checklist">
        <span className="risk-reduction-simulator__checklist-title">Recommended Actions</span>
        <ul>
          {tasks.map((task) => {
            const done = statuses[task.id] === 'completed';
            return (
              <li key={task.id} className={done ? 'risk-reduction-simulator__checklist-item--done' : ''}>
                <span aria-hidden="true">{done ? '✓' : '○'}</span> {task.primaryAction.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
