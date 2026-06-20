import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DelayPredictionPanel } from '../components/DelayPredictionPanel';
import { useDelayPrediction } from '../hooks/useDelayPrediction';
import './DelayPredictionPage.css';

const DEFAULT_DOSSIER_ID = '2';

export function DelayPredictionPage() {
  const [dossierId, setDossierId] = useState(DEFAULT_DOSSIER_ID);
  const { prediction, loading, error, search } = useDelayPrediction(DEFAULT_DOSSIER_ID);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(dossierId);
  }

  return (
    <div className="delay-prediction-page">
      <Link to="/" className="delay-prediction-page__back">
        ← Back to workflow
      </Link>

      <header className="delay-prediction-page__header">
        <h1>Delay Prediction</h1>
        <p>Estimate delay risk and the likely bottleneck phase for a dossier.</p>
      </header>

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
          {loading ? 'Predicting…' : 'Predict Delay'}
        </button>
        <small>Try any dossier ID from 1–24.</small>
      </form>

      {error && <p className="delay-prediction-page__status delay-prediction-page__status--error">{error}</p>}

      {!error && prediction && <DelayPredictionPanel prediction={prediction} />}
    </div>
  );
}
