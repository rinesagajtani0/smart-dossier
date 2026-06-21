import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DelayPredictionPanel } from '../components/DelayPredictionPanel';
import { CitizenDelayPredictionPanel } from '../components/CitizenDelayPredictionPanel';
import { AnimatedStatCard } from '../components/AnimatedStatCard';
import { DelayRiskGauge } from '../components/DelayRiskGauge';
import { DelayPredictionTimeline } from '../components/DelayPredictionTimeline';
import { WorkflowPulseIllustration } from '../components/WorkflowPulseIllustration';
import { MiniBarChart } from '../components/MiniBarChart';
import { ProcedureResultSection } from '../components/ProcedureResultSection';
import { ProcedureResultSkeleton } from '../components/ProcedureResultSkeleton';
import { Can } from '../auth/Can';
import { useDelayPrediction } from '../hooks/useDelayPrediction';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import { useDelayDashboardStats } from '../hooks/useDelayDashboardStats';
import { RISK_BADGE_LABEL, RISK_PROBABILITY, estimateCompletionDate } from '../utils/riskProbability';
import './DelayPredictionPage.css';

export function DelayPredictionPage() {
  const { dossierId, setDossierId, hint } = useDefaultDossierId('delay-prediction');
  const { prediction, loading, error, search } = useDelayPrediction(dossierId);
  const { stats } = useDelayDashboardStats();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(dossierId);
  }

  const probability = prediction ? RISK_PROBABILITY[prediction.risk] : 0;
  const estimatedCompletion = prediction ? estimateCompletionDate(prediction.predictedDelay) : null;

  return (
    <div className="delay-prediction-page">
      <Link to="/" className="delay-prediction-page__back">
        ← Back to workflow
      </Link>

      <section className="delay-prediction-page__hero">
        <div className="delay-prediction-page__hero-particles" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} className="delay-prediction-page__particle" />
          ))}
        </div>

        <div className="delay-prediction-page__hero-text">
          <span className="delay-prediction-page__hero-badge">✨ AI-Powered Prediction Engine</span>
          <h1>AI Delay Prediction</h1>
          <p>Predict potential delays in property procedures using intelligent workflow analysis.</p>
        </div>

        <WorkflowPulseIllustration />
      </section>

      <div className="delay-prediction-page__stats">
        <AnimatedStatCard
          icon="⏱️"
          label="Average Processing Time"
          value={stats.averageProcessingDays}
          suffix=" days"
          delay={0}
        />
        <AnimatedStatCard
          icon="📈"
          label="Predicted Delay Risk"
          value={stats.highRiskPercent}
          suffix="% high risk"
          delay={90}
        />
        <AnimatedStatCard icon="🗂️" label="Active Dossiers" value={stats.activeDossiers} delay={180} />
        <AnimatedStatCard
          icon="🧠"
          label="AI Prediction Accuracy"
          value={91}
          suffix="%"
          caption="based on historical patterns"
          delay={270}
        />
      </div>

      <div className="delay-prediction-page__charts">
        <MiniBarChart title="Dossiers by Phase" icon="🏛️" data={stats.byPhase} />
        <MiniBarChart title="Dossiers by Risk Level" icon="📊" data={stats.byRisk} />
      </div>

      <form className="delay-prediction-page__form" onSubmit={handleSearch}>
        <label>
          <span>Dossier ID</span>
          <input
            type="text"
            value={dossierId}
            onChange={(event) => setDossierId(event.target.value)}
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="delay-prediction-page__spinner" aria-hidden="true" />
              Predicting…
            </>
          ) : (
            '🔮 Predict Delay'
          )}
        </button>
        <small>{hint}</small>
      </form>

      {error && <p className="delay-prediction-page__status delay-prediction-page__status--error">⚠ {error}</p>}

      {loading && <ProcedureResultSkeleton />}

      {!loading && !error && prediction && (
        <>
          <div className="delay-prediction-page__score-card">
            <DelayRiskGauge percent={probability} riskLevel={prediction.risk} />

            <div className="delay-prediction-page__score-details">
              <span
                className={`delay-prediction-page__risk-pill delay-prediction-page__risk-pill--${prediction.risk}`}
              >
                {RISK_BADGE_LABEL[prediction.risk]}
              </span>
              <p className="delay-prediction-page__score-delay">
                Predicted delay: <strong>{prediction.predictedDelay}</strong>
              </p>
              {estimatedCompletion && (
                <p className="delay-prediction-page__score-completion">
                  📅 Estimated completion: <strong>{estimatedCompletion}</strong>
                </p>
              )}
            </div>
          </div>

          <DelayPredictionTimeline likelyBlockage={prediction.likelyBlockage} />

          <ProcedureResultSection
            label="AI Insights"
            icon="🧠"
            collapsible
            defaultOpen
            badge={
              <span
                className={`delay-prediction-page__risk-pill delay-prediction-page__risk-pill--${prediction.risk}`}
              >
                {probability}% probability
              </span>
            }
          >
            <p className="delay-prediction-page__insight-text">
              Based on historical workflow patterns, this dossier has a <strong>{probability}%</strong> probability
              of experiencing delays during <strong>{prediction.likelyBlockage}</strong>. {prediction.reason}
            </p>
          </ProcedureResultSection>

          <Can
            permission="view-delay-prediction"
            fallback={<CitizenDelayPredictionPanel dossierId={dossierId} prediction={prediction} />}
          >
            <DelayPredictionPanel prediction={prediction} />
          </Can>
        </>
      )}
    </div>
  );
}
