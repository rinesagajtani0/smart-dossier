import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DelayPredictionPanel } from '../components/DelayPredictionPanel';
import { CitizenDelayPredictionPanel } from '../components/CitizenDelayPredictionPanel';
import { Can } from '../auth/Can';
import { useDelayPrediction } from '../hooks/useDelayPrediction';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import './DelayPredictionPage.css';

export function DelayPredictionPage() {
  const { dossierId, setDossierId, hint } = useDefaultDossierId('delay-prediction');
  const { prediction, loading, error, search } = useDelayPrediction(dossierId);

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
        <small>{hint}</small>
      </form>

      {error && <p className="delay-prediction-page__status delay-prediction-page__status--error">{error}</p>}

      {!error && prediction && (
        <Can
          permission="view-delay-prediction"
          fallback={<CitizenDelayPredictionPanel dossierId={dossierId} prediction={prediction} />}
        >
          <DelayPredictionPanel prediction={prediction} />
        </Can>
      )}
    </div>
  );
}
