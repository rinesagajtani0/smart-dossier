import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isApplicationSubmitted } from '../hooks/useApplicationSubmission';
import { isExtractionConfirmed } from '../hooks/useExtractionConfirmation';
import type { StaffDossier } from '../services/roleService';
import './SubmittedApplicationsQueue.css';

interface SubmittedApplicationsQueueProps {
  dossiers: StaffDossier[];
}

export function SubmittedApplicationsQueue({ dossiers }: SubmittedApplicationsQueueProps) {
  // A citizen's "submitted" flag and a dossier's "extraction confirmed" flag
  // both live in localStorage (see useApplicationSubmission /
  // useExtractionConfirmation) — there's no backend field for either yet.
  // Re-derived from the current dossier list on every render: confirming
  // happens on the NLP Extraction page now, and navigating back here
  // remounts this list, so there's no need to track removal locally.
  const submittedDossiers = useMemo(
    () =>
      dossiers.filter(
        (dossier) => isApplicationSubmitted(String(dossier.id)) && !isExtractionConfirmed(String(dossier.id)),
      ),
    [dossiers],
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedDossier = submittedDossiers.find((dossier) => dossier.id === selectedId) ?? submittedDossiers[0];

  if (submittedDossiers.length === 0) {
    return null;
  }

  return (
    <section className="submitted-applications-queue">
      <h2 className="staff-role-section__title">Submitted Applications</h2>
      <p className="submitted-applications-queue__hint">
        Citizens have submitted these applications — open NLP Extraction to run extraction, review the fields, and
        confirm before the dossier continues.
      </p>

      <div className="roles-page__split">
        <div className="roles-page__panel">
          <div className="roles-page__panel-header">
            <h3>Awaiting Review</h3>
            <span>{submittedDossiers.length} dossiers</span>
          </div>
          <div className="roles-page__list">
            {submittedDossiers.map((dossier) => (
              <button
                key={dossier.id}
                type="button"
                className={
                  selectedDossier?.id === dossier.id
                    ? 'roles-page__list-item roles-page__list-item--active'
                    : 'roles-page__list-item'
                }
                onClick={() => setSelectedId(dossier.id)}
              >
                <span>
                  <strong>{dossier.trackingCode}</strong>
                  {dossier.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="roles-page__panel">
          <div className="roles-page__panel-header">
            <h3>Next Step</h3>
          </div>
          {selectedDossier && (
            <div className="submitted-applications-queue__preview">
              <strong>{selectedDossier.trackingCode}</strong>
              <span>{selectedDossier.title}</span>
              <p>
                {selectedDossier.missingFields.length > 0
                  ? `Missing fields so far: ${selectedDossier.missingFields.join(', ')}`
                  : 'No missing fields flagged yet — ready for extraction.'}
              </p>
              <Link
                to="/nlp-extraction"
                state={{ dossier: selectedDossier }}
                className="submitted-applications-queue__action"
              >
                Open NLP Extraction →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
