import { Link } from 'react-router-dom';
import { PreventDelayPanel } from '../components/PreventDelayPanel';
import { CitizenPreventDelayPanel } from '../components/CitizenPreventDelayPanel';
import { AnimatedStatCard } from '../components/AnimatedStatCard';
import { PreventionPulseIllustration } from '../components/PreventionPulseIllustration';
import { PreventionComparisonSection } from '../components/PreventionComparisonSection';
import { RecommendationCard } from '../components/RecommendationCard';
import { RiskReductionSimulator } from '../components/RiskReductionSimulator';
import { PreventionCompletionBar } from '../components/PreventionCompletionBar';
import { PreventionTimeline } from '../components/PreventionTimeline';
import { ProcedureResultSkeleton } from '../components/ProcedureResultSkeleton';
import { Can } from '../auth/Can';
import { usePreventDelay } from '../hooks/usePreventDelay';
import type { PreventDelayPlan } from '../hooks/usePreventDelay';
import { usePreventionEngine } from '../hooks/usePreventionEngine';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import { RISK_PROBABILITY, parseUpperBoundDays } from '../utils/riskProbability';
import type { RiskLevel } from '../types/dossier';
import './PreventDelayPage.css';

// "Safety score" per risk tier — same kind of presentational mapping
// usePreventDelay already uses for RISK_DOWNGRADE, just expressed as a
// score instead of a tier. Driven by the engine's live (real, recalculated)
// risk once it loads, so this card updates as prevention actions complete.
const RISK_SAFETY_SCORE: Record<RiskLevel, number> = {
  high: 30,
  medium: 65,
  low: 90,
};

function compliancePercent(remainingMissing: number, nextSteps: number): number {
  const total = remainingMissing + nextSteps;
  if (total === 0) return 100;
  return Math.round((nextSteps / total) * 100);
}

// 3 = "Risk Detection", 4 = "Prevention Actions", 5 = "Successful Completion"
// in PreventionTimeline's 6 stages — picked from real plan data, not fixed.
function timelineHighlight(plan: PreventDelayPlan, remainingMissing: number): number {
  if (remainingMissing > 0) return 3;
  if (plan.nextSteps.length > 0) return 4;
  return 5;
}

export function PreventDelayPage() {
  const { dossierId, setDossierId, hint } = useDefaultDossierId('prevent-delay');
  const { plan, loading, error, preventDelay } = usePreventDelay();
  const engine = usePreventionEngine(dossierId, plan);

  const remainingMissing = plan ? Math.max(0, plan.missingDocuments.length - engine.documentsRecovered) : 0;
  const completedCount = engine.tasks.filter((task) => engine.statuses[task.id] === 'completed').length;
  const liveRisk = engine.live?.risk ?? plan?.updatedRisk;

  const beforePercent = engine.baseline ? RISK_PROBABILITY[engine.baseline.risk] : null;
  const afterPercent = engine.live ? RISK_PROBABILITY[engine.live.risk] : null;
  const riskReducedPoints = beforePercent !== null && afterPercent !== null ? Math.max(0, beforePercent - afterPercent) : 0;
  const daysSaved =
    engine.baseline && engine.live
      ? Math.max(0, (parseUpperBoundDays(engine.baseline.predictedDelay) ?? 0) - (parseUpperBoundDays(engine.live.predictedDelay) ?? 0))
      : 0;

  return (
    <div className="prevent-delay-page">
      <Link to="/" className="prevent-delay-page__back">
        ← Back to workflow
      </Link>

      <section className="prevent-delay-page__hero">
        <div className="prevent-delay-page__hero-particles" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} className="prevent-delay-page__particle" />
          ))}
        </div>

        <div className="prevent-delay-page__hero-text">
          <span className="prevent-delay-page__hero-badge">✨ AI-Powered Prevention Engine</span>
          <h1>AI Delay Prevention</h1>
          <p>Identify risks early, receive recommendations, and prevent delays before they impact property procedures.</p>
        </div>

        <PreventionPulseIllustration />
      </section>

      <PreventionComparisonSection />

      <div className="prevent-delay-page__controls">
        <label>
          <span>Dossier ID</span>
          <input
            type="text"
            value={dossierId}
            onChange={(event) => setDossierId(event.target.value)}
            disabled={loading}
          />
        </label>
        <button
          type="button"
          className="prevent-delay-page__button"
          onClick={() => preventDelay(dossierId)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="prevent-delay-page__spinner" aria-hidden="true" />
              Generating…
            </>
          ) : (
            '🛡️ Prevent Delay'
          )}
        </button>
        <small>{hint}</small>
      </div>

      {error && <p className="prevent-delay-page__status prevent-delay-page__status--error">⚠ {error}</p>}

      {loading && <ProcedureResultSkeleton />}

      {!loading && !error && plan && (
        <>
          <div className="prevent-delay-page__stats">
            <AnimatedStatCard
              icon="🛡️"
              label="Risk Prevention Score"
              value={liveRisk ? RISK_SAFETY_SCORE[liveRisk] : 0}
              suffix="%"
              delay={0}
            />
            <AnimatedStatCard icon="🔎" label="Potential Issues Detected" value={plan.checklist.length} delay={90} />
            <AnimatedStatCard icon="📄" label="Missing Documents" value={remainingMissing} delay={180} />
            <AnimatedStatCard
              icon="✅"
              label="Compliance Status"
              value={compliancePercent(remainingMissing, plan.nextSteps.length)}
              suffix="%"
              delay={270}
            />
          </div>

          {engine.tasks.length > 0 && (
            <PreventionCompletionBar completed={completedCount} total={engine.tasks.length} />
          )}

          {engine.baseline && engine.live && (
            <RiskReductionSimulator
              baseline={engine.baseline}
              live={engine.live}
              tasks={engine.tasks}
              statuses={engine.statuses}
            />
          )}

          {engine.engineError && (
            <p className="prevent-delay-page__status prevent-delay-page__status--error">⚠ {engine.engineError}</p>
          )}

          {engine.tasks.length > 0 && (
            <section className="prevent-delay-page__recommendations">
              <h2 className="prevent-delay-page__section-title">
                <span aria-hidden="true">🧠</span> AI Recommendations
              </h2>
              <div className="prevent-delay-page__recommendations-grid">
                {engine.tasks.map((task, index) => (
                  <RecommendationCard
                    key={task.id}
                    delay={index * 80}
                    title={task.title}
                    severity={task.severity}
                    action={task.action}
                    impact={task.impact}
                    riskImpactPercent={task.riskImpactPercent}
                    status={engine.statuses[task.id] ?? 'pending'}
                    resolving={engine.resolvingTaskId === task.id}
                    primaryActionLabel={task.primaryAction.label}
                    secondaryActionLabel={task.secondaryAction.label}
                    onPrimaryAction={() => engine.resolveTask(task.id)}
                    onSecondaryAction={() => engine.resolveTask(task.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {completedCount > 0 && (
            <section className="prevent-delay-page__metrics">
              <h2 className="prevent-delay-page__section-title">
                <span aria-hidden="true">📈</span> Success Metrics
              </h2>
              <div className="prevent-delay-page__metrics-grid">
                <AnimatedStatCard icon="⏱️" label="Estimated Days Saved" value={daysSaved} suffix=" days" delay={0} />
                <AnimatedStatCard
                  icon="📉"
                  label="Delay Risk Reduced"
                  value={riskReducedPoints}
                  suffix="%"
                  delay={90}
                />
                <AnimatedStatCard icon="📄" label="Documents Recovered" value={engine.documentsRecovered} delay={180} />
                <AnimatedStatCard icon="✅" label="Issues Resolved" value={completedCount} delay={270} />
              </div>
            </section>
          )}

          <section className="prevent-delay-page__timeline-section">
            <h2 className="prevent-delay-page__section-title">
              <span aria-hidden="true">🗺️</span> Risk Monitoring Timeline
            </h2>
            <PreventionTimeline highlightIndex={timelineHighlight(plan, remainingMissing)} />
          </section>

          <Can permission="use-prevent-delay" fallback={<CitizenPreventDelayPanel plan={plan} />}>
            <PreventDelayPanel plan={plan} />
          </Can>
        </>
      )}
    </div>
  );
}
