import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LegalImpactPanel } from '../components/LegalImpactPanel';
import { useLegalImpactGraph } from '../hooks/useLegalImpactGraph';
import { getLegalChanges } from '../services/legalImpactService';
import type { LegalChangeSummary } from '../services/legalImpactService';
import './LegalImpactDashboardPage.css';

export function LegalImpactDashboardPage() {
  const [legalChanges, setLegalChanges] = useState<LegalChangeSummary[]>([]);
  const [legalChangeId, setLegalChangeId] = useState('');
  const [listError, setListError] = useState<string | null>(null);
  const { impact, loading, error, search } = useLegalImpactGraph();

  useEffect(() => {
    getLegalChanges()
      .then((changes) => {
        setLegalChanges(changes);
        if (changes.length > 0) {
          setLegalChangeId(changes[0].id);
          search(changes[0].id);
        }
      })
      .catch((err) => setListError(err instanceof Error ? err.message : 'Could not load legal changes.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (legalChangeId) search(legalChangeId);
  }

  return (
    <div className="legal-impact-dashboard-page">
      <Link to="/" className="legal-impact-dashboard-page__back">
        ← Back to workflow
      </Link>

      <header className="legal-impact-dashboard-page__header">
        <h1>Legal Impact Dashboard</h1>
        <p>Pick a legal or regulatory change to see how it propagates through the workflow, and how many dossiers need review.</p>
      </header>

      <form className="legal-impact-dashboard-page__form" onSubmit={handleSearch}>
        <label>
          <span>Legal Change</span>
          <select
            value={legalChangeId}
            onChange={(event) => setLegalChangeId(event.target.value)}
            disabled={loading || legalChanges.length === 0}
          >
            {legalChanges.map((change) => (
              <option key={change.id} value={change.id}>
                {change.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={loading || !legalChangeId}>
          {loading ? 'Checking…' : 'Check Legal Impact'}
        </button>
      </form>

      {listError && (
        <p className="legal-impact-dashboard-page__status legal-impact-dashboard-page__status--error">{listError}</p>
      )}
      {error && (
        <p className="legal-impact-dashboard-page__status legal-impact-dashboard-page__status--error">{error}</p>
      )}

      {!error && impact && <LegalImpactPanel impact={impact} />}
    </div>
  );
}
