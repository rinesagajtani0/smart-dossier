import type { RiskLevel } from '../types/dossier';
import type { SimilarCase } from '../services/dossierService';
import { StatCard } from './StatCard';
import { RiskBadge } from './PhaseBadge';
import './CaseProgressInsights.css';

interface CaseProgressInsightsProps {
  cases: SimilarCase[];
}

const STAGES = ['Submitted', 'Under Review', 'Decision'] as const;

function normalizeOutcome(outcome: string | null): 'approved' | 'delayed' | 'rejected' | 'unknown' {
  const key = outcome?.toLowerCase();
  if (key === 'approved' || key === 'delayed' || key === 'rejected') return key;
  return 'unknown';
}

function buildInsights(cases: SimilarCase[]) {
  const total = cases.length;
  const counts = { approved: 0, delayed: 0, rejected: 0, unknown: 0 };
  const delayReasonCounts = new Map<string, number>();

  for (const item of cases) {
    counts[normalizeOutcome(item.outcome)] += 1;
    if (item.delayReason) {
      delayReasonCounts.set(item.delayReason, (delayReasonCounts.get(item.delayReason) ?? 0) + 1);
    }
  }

  const toPercent = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));
  const approvedPct = toPercent(counts.approved);
  const delayedPct = toPercent(counts.delayed);
  const rejectedPct = toPercent(counts.rejected);

  let topDelayReason: string | null = null;
  let topDelayCount = 0;
  for (const [reason, count] of delayReasonCounts) {
    if (count > topDelayCount) {
      topDelayReason = reason;
      topDelayCount = count;
    }
  }

  const unfavorablePct = delayedPct + rejectedPct;
  const riskLevel: RiskLevel = unfavorablePct >= 50 ? 'high' : unfavorablePct >= 20 ? 'medium' : 'low';

  const messages: string[] = [];
  if (approvedPct >= 50) {
    messages.push('Most similar applications were completed successfully.');
  }
  if (topDelayReason) {
    messages.push(`Similar applications experienced delays due to ${topDelayReason.toLowerCase()}.`);
  }
  if (riskLevel === 'low') {
    messages.push('Your application is following a normal processing pattern.');
  }

  return { total, approvedPct, delayedPct, rejectedPct, riskLevel, messages };
}

export function CaseProgressInsights({ cases }: CaseProgressInsightsProps) {
  const { total, approvedPct, delayedPct, rejectedPct, riskLevel, messages } = buildInsights(cases);
  const currentStageIndex = riskLevel === 'high' ? 1 : 2;

  if (total === 0) {
    return (
      <div className="case-progress-insights">
        <div className="case-progress-insights__header">
          <h2>Case Progress Insights</h2>
        </div>
        <p className="case-progress-insights__empty">
          Not enough similar applications yet to show insights for this dossier.
        </p>
      </div>
    );
  }

  return (
    <div className="case-progress-insights">
      <div className="case-progress-insights__header">
        <h2>Case Progress Insights</h2>
        <RiskBadge riskLevel={riskLevel} />
      </div>

      <ol className="case-progress-insights__stages">
        {STAGES.map((stage, index) => (
          <li
            key={stage}
            className={
              index <= currentStageIndex
                ? 'case-progress-insights__stage case-progress-insights__stage--active'
                : 'case-progress-insights__stage'
            }
          >
            {stage}
          </li>
        ))}
      </ol>

      <div className="case-progress-insights__cards">
        <StatCard label="Completed Successfully" value={approvedPct} suffix="%" icon="✅" />
        <StatCard label="Experienced Delays" value={delayedPct} suffix="%" tone="warning" icon="⏳" />
        <StatCard label="Not Approved" value={rejectedPct} suffix="%" tone="danger" icon="⚠" />
      </div>

      <div
        className="case-progress-insights__chart"
        role="img"
        aria-label={`Outcome breakdown of similar applications: ${approvedPct}% completed successfully, ${delayedPct}% delayed, ${rejectedPct}% not approved`}
      >
        <div className="case-progress-insights__chart-track">
          {approvedPct > 0 && (
            <div
              className="case-progress-insights__chart-segment case-progress-insights__chart-segment--approved"
              style={{ width: `${approvedPct}%` }}
            />
          )}
          {delayedPct > 0 && (
            <div
              className="case-progress-insights__chart-segment case-progress-insights__chart-segment--delayed"
              style={{ width: `${delayedPct}%` }}
            />
          )}
          {rejectedPct > 0 && (
            <div
              className="case-progress-insights__chart-segment case-progress-insights__chart-segment--rejected"
              style={{ width: `${rejectedPct}%` }}
            />
          )}
        </div>
        <div className="case-progress-insights__chart-legend">
          <span>
            <i className="case-progress-insights__dot case-progress-insights__dot--approved" />
            Completed
          </span>
          <span>
            <i className="case-progress-insights__dot case-progress-insights__dot--delayed" />
            Delayed
          </span>
          <span>
            <i className="case-progress-insights__dot case-progress-insights__dot--rejected" />
            Not approved
          </span>
        </div>
      </div>

      <ul className="case-progress-insights__messages">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
