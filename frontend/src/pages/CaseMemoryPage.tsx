import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SimilarCasesPanel } from '../components/SimilarCasesPanel';
import { useCaseMemory } from '../hooks/useCaseMemory';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import './CaseMemoryPage.css';

export function CaseMemoryPage() {
  const { dossierId, setDossierId, hint } = useDefaultDossierId('case-memory');
  const { cases, loading, error, search } = useCaseMemory(dossierId);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(dossierId);
  }

  return (
    <div className="case-memory-page">
      <Link to="/" className="case-memory-page__back">
        ← Back to workflow
      </Link>

      <header className="case-memory-page__header">
        <h1>Case Memory</h1>
        <p>Find historically similar dossiers and see how they were ultimately resolved.</p>
      </header>

      <form className="case-memory-page__form" onSubmit={handleSearch}>
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
          {loading ? 'Searching…' : 'Find Similar Cases'}
        </button>
        <small>{hint}</small>
      </form>

      {error && <p className="case-memory-page__status case-memory-page__status--error">{error}</p>}

      {!error && <SimilarCasesPanel cases={cases} />}
    </div>
  );
}
