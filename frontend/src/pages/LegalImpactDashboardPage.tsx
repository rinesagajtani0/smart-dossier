import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LegalImpactPanel } from '../components/LegalImpactPanel';
import { useLegalImpactGraph } from '../hooks/useLegalImpactGraph';
import './LegalImpactDashboardPage.css';

const DEFAULT_DOSSIER_ID = '1';

export function LegalImpactDashboardPage() {
  const [dossierId, setDossierId] = useState(DEFAULT_DOSSIER_ID);
  const { impact, loading, error, search } = useLegalImpactGraph(DEFAULT_DOSSIER_ID);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(dossierId);
  }

  return (
    <div className="legal-impact-dashboard-page">
      <Link to="/" className="legal-impact-dashboard-page__back">
        ← Back to workflow
      </Link>

      <header className="legal-impact-dashboard-page__header">
        <h1>Legal Impact Dashboard</h1>
        <p>See how a legal or regulatory change propagates through the workflow, and how many dossiers need review.</p>
      </header>

      <form className="legal-impact-dashboard-page__form" onSubmit={handleSearch}>
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
          {loading ? 'Checking…' : 'Check Legal Impact'}
        </button>
        <small>Try any dossier ID from 1–24.</small>
      </form>

      {error && (
        <p className="legal-impact-dashboard-page__status legal-impact-dashboard-page__status--error">{error}</p>
      )}

      {!error && impact && <LegalImpactPanel impact={impact} />}
    </div>
  );
}
