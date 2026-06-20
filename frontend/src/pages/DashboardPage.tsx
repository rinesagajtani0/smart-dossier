import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardKanban } from '../hooks/useDashboardKanban';
import { StatCard } from '../components/StatCard';
import { KanbanBoard } from '../components/KanbanBoard';
import './DashboardPage.css';

export function DashboardPage() {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { columns, loading: columnsLoading, error: columnsError } = useDashboardKanban();

  const loading = statsLoading || columnsLoading;
  const error = statsError ?? columnsError;

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
          <StatCard label="High Risk" value={stats.highRisk} tone="danger" />
          <StatCard label="Delayed" value={stats.delayed} tone="danger" />
          <StatCard label="Deadlines This Week" value={stats.deadlinesThisWeek} tone="warning" />
        </div>
      )}

      {!loading && !error && columns && (
        <section className="dashboard-page__board">
          <h2>Phase Overview</h2>
          <KanbanBoard columns={columns} />
        </section>
      )}
    </div>
  );
}
