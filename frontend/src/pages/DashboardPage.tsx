import { useDossiers } from '../hooks/useDossiers';
import { DossierCard } from '../components/DossierCard';
import './DashboardPage.css';

export function DashboardPage() {
  const { dossiers, loading, error } = useDossiers();

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Dossiers</h1>
        <p>Overview of all dossiers currently being tracked.</p>
      </header>

      {loading && <p className="dashboard-page__status">Loading dossiers…</p>}
      {error && <p className="dashboard-page__status dashboard-page__status--error">{error}</p>}

      {!loading && !error && (
        <div className="dashboard-page__grid">
          {dossiers.map((dossier) => (
            <DossierCard key={dossier.id} dossier={dossier} />
          ))}
        </div>
      )}
    </div>
  );
}
