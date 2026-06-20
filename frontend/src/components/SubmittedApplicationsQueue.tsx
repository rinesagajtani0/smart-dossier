import { useMemo, useState } from 'react';
import { isApplicationSubmitted } from '../hooks/useApplicationSubmission';
import { isExtractionConfirmed } from '../hooks/useExtractionConfirmation';
import { SubmittedApplicationReview } from './SubmittedApplicationReview';
import type { StaffDossier } from '../services/roleService';
import './SubmittedApplicationsQueue.css';

interface SubmittedApplicationsQueueProps {
  dossiers: StaffDossier[];
}

export function SubmittedApplicationsQueue({ dossiers }: SubmittedApplicationsQueueProps) {
  // A citizen's "submitted" flag and a dossier's "extraction confirmed" flag
  // both live in localStorage (see useApplicationSubmission /
  // useExtractionConfirmation) — there's no backend field for either yet.
  // Re-checked whenever the dossier list itself changes, plus tracked
  // locally so confirming one removes it from the queue immediately.
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(
    () => new Set(dossiers.filter((dossier) => isExtractionConfirmed(String(dossier.id))).map((dossier) => dossier.id))
  );

  const submittedDossiers = useMemo(
    () => dossiers.filter((dossier) => isApplicationSubmitted(String(dossier.id)) && !confirmedIds.has(dossier.id)),
    [dossiers, confirmedIds]
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
        Citizens have submitted these applications — run NLP extraction and confirm the extracted fields before the
        dossier continues.
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
            <h3>Review &amp; Confirm</h3>
          </div>
          {selectedDossier && (
            <SubmittedApplicationReview
              key={selectedDossier.id}
              dossier={selectedDossier}
              onConfirmed={() => setConfirmedIds((prev) => new Set(prev).add(selectedDossier.id))}
            />
          )}
        </div>
      </div>
    </section>
  );
}
