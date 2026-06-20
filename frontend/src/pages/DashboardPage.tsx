import { Link } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardKanban } from '../hooks/useDashboardKanban';
import { useManagerDashboard } from '../hooks/useManagerDashboard';
import { StatCard } from '../components/StatCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { Can } from '../auth/Can';
import { BOTTLENECK_LABELS } from '../utils/phase';
import './DashboardPage.css';

export function DashboardPage() {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { columns, loading: columnsLoading, error: columnsError } = useDashboardKanban();
  const { managerDashboard, loading: managerLoading } = useManagerDashboard();

  const loading = statsLoading || columnsLoading;
  const error = statsError ?? columnsError;

  const bottlenecks = stats
    ? Object.entries(BOTTLENECK_LABELS)
        .map(([phase, label]) => ({ label, count: stats.byPhase[phase] ?? 0 }))
        .sort((a, b) => b.count - a.count)
    : [];

  const totalByRisk = stats ? stats.byRisk.low + stats.byRisk.medium + stats.byRisk.high : 0;
  const riskShare = (level: 'low' | 'medium' | 'high') =>
    stats && totalByRisk > 0 ? Math.round((stats.byRisk[level] / totalByRisk) * 100) : 0;

  // No single "active dossiers" field exists on /dashboard/stats — derived
  // from the kanban data (which already includes every dossier's status)
  // instead of asking the backend for a new one.
  const activeDossiers = columns
    ? Object.values(columns).reduce(
        (count, cards) => count + cards.filter((card) => card.status === 'open').length,
        0
      )
    : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Operations Dashboard</h1>
        <p>Real-time overview of dossier processing across all phases.</p>
      </header>

      {loading && <p className="dashboard-page__status">Loading dashboard…</p>}
      {error && <p className="dashboard-page__status dashboard-page__status--error">{error}</p>}

      {!loading && !error && stats && (
        <div className="dashboard-page__stats">
          <StatCard label="Total Dossiers" value={stats.totalDossiers} />
          <StatCard label="Active Dossiers" value={activeDossiers} />
          <StatCard label="High Risk Dossiers" value={stats.highRisk} tone="danger" />
          <StatCard label="Delayed Dossiers" value={stats.delayed} tone="danger" />
          <StatCard label="Deadlines This Week" value={stats.deadlinesThisWeek} tone="warning" />
          <StatCard
            label="Legally Impacted Dossiers"
            value={stats.legalImpacted}
            tone="legal"
            icon="⚖"
            trend="up"
          />
        </div>
      )}

      {/* Decision-support view for managers: where dossiers are stalling,
          which dossiers carry the most risk, and what needs attention right
          now — distinct from the phase-by-phase processing view below. */}
      <Can permission="view-manager-reports">
        {!loading && !error && stats && (
          <section className="dashboard-page__decision-support">
            <div className="dashboard-page__panel">
              <h2>Bottlenecks</h2>
              <div className="dashboard-page__bottleneck-list">
                {bottlenecks.map((item) => (
                  <div className="dashboard-page__bottleneck-row" key={item.label}>
                    <span className="dashboard-page__bottleneck-label">{item.label}</span>
                    <div className="dashboard-page__bottleneck-track">
                      <div
                        className="dashboard-page__bottleneck-fill"
                        style={{ width: stats.totalDossiers ? `${(item.count / stats.totalDossiers) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="dashboard-page__bottleneck-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-page__split">
              <div className="dashboard-page__panel">
                <h2>Risk Monitoring</h2>
                <p className="dashboard-page__panel-label">Highest-Risk Dossiers</p>
                <div className="dashboard-page__list">
                  {!managerLoading &&
                    managerDashboard?.highRiskDossiers.slice(0, 6).map((dossier) => (
                      <Link to={`/dossiers/${dossier.id}`} className="dashboard-page__row" key={dossier.id}>
                        <span>
                          <strong>{dossier.trackingCode}</strong> {dossier.title}
                        </span>
                        <span>
                          {dossier.daysUntilDeadline != null
                            ? `${dossier.daysUntilDeadline}d to deadline`
                            : 'no deadline'}
                        </span>
                      </Link>
                    ))}
                  {!managerLoading && managerDashboard?.highRiskDossiers.length === 0 && (
                    <p className="dashboard-page__empty">No high-risk dossiers right now.</p>
                  )}
                </div>

                <p className="dashboard-page__panel-label">Workload Distribution</p>
                <div className="dashboard-page__workload-track">
                  <div
                    className="dashboard-page__workload-segment dashboard-page__workload-segment--low"
                    style={{ width: `${riskShare('low')}%` }}
                  />
                  <div
                    className="dashboard-page__workload-segment dashboard-page__workload-segment--medium"
                    style={{ width: `${riskShare('medium')}%` }}
                  />
                  <div
                    className="dashboard-page__workload-segment dashboard-page__workload-segment--high"
                    style={{ width: `${riskShare('high')}%` }}
                  />
                </div>
                <div className="dashboard-page__workload-legend">
                  <span>Low {stats.byRisk.low}</span>
                  <span>Medium {stats.byRisk.medium}</span>
                  <span>High {stats.byRisk.high}</span>
                </div>
              </div>

              <div className="dashboard-page__panel">
                <h2>Recommended Focus</h2>
                {!managerLoading && managerDashboard?.recommendedFocus ? (
                  <div className="dashboard-page__focus">
                    <strong>{managerDashboard.recommendedFocus.trackingCode}</strong>
                    <span>{managerDashboard.recommendedFocus.title}</span>
                    <p>{managerDashboard.recommendedFocus.missingFields.join(', ') || 'No missing fields'}</p>
                    <Link to={`/dossiers/${managerDashboard.recommendedFocus.id}`} className="dashboard-page__focus-link">
                      Review dossier →
                    </Link>
                  </div>
                ) : (
                  !managerLoading && <p className="dashboard-page__empty">No dossier currently needs urgent focus.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </Can>

      {!loading && !error && columns && (
        <section className="dashboard-page__board">
          <h2>Phase Overview</h2>
          <KanbanBoard columns={columns} />
        </section>
      )}
    </div>
  );
}
