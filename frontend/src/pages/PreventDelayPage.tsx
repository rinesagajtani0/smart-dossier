import { Link } from 'react-router-dom';
import { PreventDelayPanel } from '../components/PreventDelayPanel';
import { CitizenPreventDelayPanel } from '../components/CitizenPreventDelayPanel';
import { Can } from '../auth/Can';
import { usePreventDelay } from '../hooks/usePreventDelay';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import './PreventDelayPage.css';

export function PreventDelayPage() {
  const { dossierId, setDossierId, hint } = useDefaultDossierId('prevent-delay');
  const { plan, loading, error, preventDelay } = usePreventDelay();

  return (
    <div className="prevent-delay-page">
      <Link to="/" className="prevent-delay-page__back">
        ← Back to workflow
      </Link>

      <header className="prevent-delay-page__header">
        <h1>Prevent Delay</h1>
        <p>The final intervention: a concrete action plan and a ready-to-send letter, before the delay happens.</p>
      </header>

      <div className="prevent-delay-page__controls">
        <label>
          <span>Dossier ID</span>
          <input
            type="text"
            value={dossierId}
            onChange={(event) => setDossierId(event.target.value)}
            disabled={loading}
          />
        </label>
        <button
          type="button"
          className="prevent-delay-page__button"
          onClick={() => preventDelay(dossierId)}
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Prevent Delay'}
        </button>
        <small>{hint}</small>
      </div>

      {error && <p className="prevent-delay-page__status prevent-delay-page__status--error">{error}</p>}

      {plan && (
        <Can permission="use-prevent-delay" fallback={<CitizenPreventDelayPanel plan={plan} />}>
          <PreventDelayPanel plan={plan} />
        </Can>
      )}
    </div>
  );
}
