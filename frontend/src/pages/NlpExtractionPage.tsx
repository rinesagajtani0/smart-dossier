import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ExtractionResultPanel } from '../components/ExtractionResultPanel';
import { DossierExtractionReview } from '../components/DossierExtractionReview';
import { useNlpExtraction } from '../hooks/useNlpExtraction';
import { usePersistentState } from '../state/usePersistentState';
import { isApplicationSubmitted } from '../hooks/useApplicationSubmission';
import { isExtractionConfirmed } from '../hooks/useExtractionConfirmation';
import { getStaffDossiers } from '../services/roleService';
import type { StaffDossier } from '../services/roleService';
import './NlpExtractionPage.css';

export function NlpExtractionPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialDocumentId = searchParams.get('documentId') ?? '';
  const dossierIdParam = searchParams.get('dossierId');
  // Coming from the Submitted Applications queue passes the dossier
  // straight through router state (no extra fetch needed). A bare
  // ?dossierId= link (e.g. a reload, or a bookmarked/shared URL) falls back
  // to looking it up, so the dossier-review flow still works either way.
  const stateDossier = (location.state as { dossier?: StaffDossier } | null)?.dossier ?? null;

  const [staffDossiers, setStaffDossiers] = useState<StaffDossier[]>(stateDossier ? [stateDossier] : []);
  const [queueDossier, setQueueDossier] = useState<StaffDossier | null>(stateDossier);
  const [queueDossierLoading, setQueueDossierLoading] = useState(true);
  const [queueDossierError, setQueueDossierError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getStaffDossiers()
      .then((list) => {
        if (!mounted) return;
        setStaffDossiers(list);
        setQueueDossierError(null);

        const routeDossier =
          stateDossier ?? (dossierIdParam ? list.find((item) => String(item.id) === dossierIdParam) ?? null : null);
        setQueueDossier(routeDossier);
        if (dossierIdParam && !routeDossier) {
          setQueueDossierError('Could not find that dossier in the staff queue.');
        }
      })
      .catch((err) => {
        if (mounted) setQueueDossierError(err instanceof Error ? err.message : 'Could not load submitted applications.');
      })
      .finally(() => {
        if (mounted) setQueueDossierLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dossierIdParam, stateDossier]);

  const submittedDossiers = useMemo(
    () =>
      staffDossiers.filter(
        (dossier) => isApplicationSubmitted(String(dossier.id)) && !isExtractionConfirmed(String(dossier.id)),
      ),
    [staffDossiers],
  );

  const [documentId, setDocumentId] = usePersistentState('nlp-extraction:documentId', initialDocumentId);
  const { result, loading, error, extract } = useNlpExtraction();

  useEffect(() => {
    // An explicit ?documentId= link (e.g. from Document Upload) always wins
    // over whatever's persisted — but only run the extraction if we don't
    // already have a result for that same document, so coming back to this
    // page doesn't silently re-trigger a fetch for data we already have.
    if (!initialDocumentId) return;
    if (initialDocumentId !== documentId) setDocumentId(initialDocumentId);
    if (!result || String(result.id) !== initialDocumentId) extract(initialDocumentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDocumentId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    extract(documentId);
  }

  return (
    <div className="nlp-extraction-page">
      <Link to="/" className="nlp-extraction-page__back">
        ← Back to workflow
      </Link>

      <header className="nlp-extraction-page__header">
        <span className="nlp-extraction-page__eyebrow">Staff Workflow</span>
        <h1>NLP Extraction</h1>
        <p>
          Run field extraction on an uploaded document, review the results, then confirm to move the dossier
          forward in the workflow.
        </p>
      </header>

      {queueDossierLoading && <p className="nlp-extraction-page__status">Loading submitted applications…</p>}
      {queueDossierError && (
        <p className="nlp-extraction-page__status nlp-extraction-page__status--error">{queueDossierError}</p>
      )}

      {queueDossier ? (
        <DossierExtractionReview dossier={queueDossier} />
      ) : (
        <>
          {submittedDossiers.length > 0 && (
            <section className="nlp-extraction-page__queue">
              <div className="nlp-extraction-page__queue-header">
                <div>
                  <h2>Submitted Applications</h2>
                  <p>Select an application to automatically load its latest uploaded document.</p>
                </div>
                <span>{submittedDossiers.length} awaiting review</span>
              </div>

              <div className="nlp-extraction-page__queue-list">
                {submittedDossiers.map((dossier) => (
                  <button
                    key={dossier.id}
                    type="button"
                    className="nlp-extraction-page__queue-item"
                    onClick={() => setQueueDossier(dossier)}
                  >
                    <span>
                      <strong>{dossier.trackingCode}</strong>
                      {dossier.title}
                    </span>
                    <span>{dossier.riskLevel} risk</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <form className="nlp-extraction-page__form" onSubmit={handleSubmit}>
            <label>
              <span>Document ID</span>
              <input
                type="text"
                value={documentId}
                onChange={(event) => setDocumentId(event.target.value)}
                disabled={loading}
                placeholder="e.g. 1"
              />
            </label>
            <button type="submit" disabled={loading || !documentId}>
              {loading ? 'Extracting…' : 'Extract Fields'}
            </button>
            <small>Advanced fallback: enter a document ID only. Submitted applications above use dossier IDs and resolve the document automatically.</small>
          </form>

          {error && <p className="nlp-extraction-page__status nlp-extraction-page__status--error">{error}</p>}

          {result && <ExtractionResultPanel data={result.extractedData} />}
        </>
      )}
    </div>
  );
}
