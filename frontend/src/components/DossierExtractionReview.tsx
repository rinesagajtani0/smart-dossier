import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExtractionResultPanel } from './ExtractionResultPanel';
import { useNlpExtraction } from '../hooks/useNlpExtraction';
import { useExtractionConfirmation } from '../hooks/useExtractionConfirmation';
import { getDossierById, updateDossier } from '../services/dossierService';
import { showToast } from '../services/toastService';
import { PHASES } from '../data/phases';
import type { StaffDossier } from '../services/roleService';
import './DossierExtractionReview.css';

interface DossierExtractionReviewProps {
  dossier: StaffDossier;
}

export function DossierExtractionReview({ dossier }: DossierExtractionReviewProps) {
  const [latestDocumentId, setLatestDocumentId] = useState<string | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const { result, loading, error, extract } = useNlpExtraction();
  const { confirmed, confirm } = useExtractionConfirmation(String(dossier.id));

  useEffect(() => {
    let isMounted = true;
    setDocumentsLoading(true);

    getDossierById(String(dossier.id))
      .then((full) => {
        if (!isMounted || !full) return;
        const sources = full.sources ?? [];
        // Most recently uploaded document — the one the citizen just
        // submitted with their application.
        setLatestDocumentId(sources.length > 0 ? sources[sources.length - 1].id : null);
      })
      .finally(() => {
        if (isMounted) setDocumentsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dossier.id]);

  async function handleConfirm() {
    if (!result) return;
    setConfirming(true);
    setConfirmError(null);

    try {
      // Confirmation is a real workflow transition, not just a data save:
      // advance to the next step in the canonical phase order (the same
      // order Kanban already groups by). Not ProcessStep.nextPhase — that
      // table is seeded in Albanian for this process type while
      // Dossier.phase is seeded in English, so the two don't line up; this
      // app's own phase list avoids that mismatch entirely. If the
      // dossier's phase isn't one of these five at all (a process type with
      // its own distinct phases), leave phase/status untouched rather than
      // guessing.
      const currentIndex = PHASES.findIndex((phase) => phase.id === dossier.phase);
      const nextPhase = currentIndex >= 0 && currentIndex < PHASES.length - 1 ? PHASES[currentIndex + 1].id : null;
      const isFinalStep = currentIndex === PHASES.length - 1;

      // The whole point of confirmation: the NLP result stops being a
      // preview and becomes part of the dossier record itself, via the
      // existing dossier-update endpoint (not a new one) — phase/status
      // move together with it in the same request.
      await updateDossier(String(dossier.id), {
        applicantName: result.extractedData.applicantName || undefined,
        ownerName: result.extractedData.ownerName || undefined,
        propertyNumber: result.extractedData.propertyNumber || undefined,
        cadastralZone: result.extractedData.cadastralZone || undefined,
        propertyLocation: result.extractedData.propertyLocation || undefined,
        missingFields: result.extractedData.missingFields,
        ...(nextPhase ? { phase: nextPhase } : isFinalStep ? { status: 'closed' } : {}),
      });
      confirm();
      showToast(
        nextPhase
          ? `Extraction confirmed for ${dossier.trackingCode} — moved to ${nextPhase}.`
          : `Extraction confirmed for ${dossier.trackingCode}.`,
        'success',
      );
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Could not confirm extraction.');
    } finally {
      setConfirming(false);
    }
  }

  if (confirmed) {
    return (
      <div className="dossier-extraction-review dossier-extraction-review--done">
        <span className="dossier-extraction-review__done-icon" aria-hidden="true">
          ✓
        </span>
        <p>Extraction confirmed. This dossier has moved on in the workflow.</p>
        <Link to="/roles" className="dossier-extraction-review__back-link">
          ← Back to Submitted Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="dossier-extraction-review">
      <div className="dossier-extraction-review__header">
        <strong>{dossier.trackingCode}</strong>
        <span>{dossier.title}</span>
      </div>

      {documentsLoading && <p className="dossier-extraction-review__status">Loading uploaded documents…</p>}

      {!documentsLoading && !latestDocumentId && (
        <p className="dossier-extraction-review__status">
          No uploaded document found for this dossier yet — extraction needs a document to read.
        </p>
      )}

      {!documentsLoading && latestDocumentId && !result && (
        <button
          type="button"
          className="dossier-extraction-review__action"
          onClick={() => extract(latestDocumentId)}
          disabled={loading}
        >
          {loading ? 'Extracting…' : 'Run NLP Extraction'}
        </button>
      )}

      {error && <p className="dossier-extraction-review__status dossier-extraction-review__status--error">{error}</p>}

      {result && (
        <>
          <ExtractionResultPanel data={result.extractedData} />

          <p className="dossier-extraction-review__hint">
            Review the extracted fields above. Confirming will save them to the dossier record and move it forward
            in the workflow.
          </p>

          {confirmError && (
            <p className="dossier-extraction-review__status dossier-extraction-review__status--error">
              {confirmError}
            </p>
          )}

          <button
            type="button"
            className="dossier-extraction-review__action dossier-extraction-review__action--confirm"
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? 'Confirming…' : 'Confirm Extraction'}
          </button>
        </>
      )}
    </div>
  );
}
