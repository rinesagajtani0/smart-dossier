import { useDossiers } from '../hooks/useDossiers';
import { StatCard } from '../components/StatCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { getDossierStats } from '../utils/dossierStats';
import './DashboardPage.css';

export function DashboardPage() {
  const { dossiers, loading, error } = useDossiers();
  const stats = getDossierStats(dossiers);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Operations Dashboard</h1>
        <p>Real-time overview of dossier processing across all phases.</p>
      </header>

      {loading && <p className="dashboard-page__status">Loading dossiers…</p>}
      {error && <p className="dashboard-page__status dashboard-page__status--error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="dashboard-page__stats">
            <StatCard label="Total Dossiers" value={stats.total} />
            <StatCard label="High Risk" value={stats.highRisk} tone="danger" />
            <StatCard label="Delayed" value={stats.delayed} tone="danger" />
            <StatCard label="Deadlines This Week" value={stats.dueThisWeek} tone="warning" />
          </div>

          <section className="dashboard-page__board">
            <h2>Phase Overview</h2>
            <KanbanBoard dossiers={dossiers} />
          </section>
        </>
      )}
    </div>
  );
}
