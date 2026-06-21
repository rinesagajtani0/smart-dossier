import type { CSSProperties } from 'react';
import './CitizenTrackingTimeline.css';

const STEPS = [
  'Application Submitted',
  'Waiting for Staff Review',
  'NLP Extraction Completed',
  'Document Verification',
  'Case Review',
  'Decision Pending',
];

interface CitizenTrackingTimelineProps {
  phase: string;
  status: string;
}

// The citizen never sees staff actions (running extraction, confirming
// fields) — only the milestone those actions complete. Phase/status are the
// only signals the tracking API exposes, so each dossier phase is mapped to
// the milestone it implies is done. Confirming extraction is what advances
// a dossier out of "Intake" in this app, so steps 1-2 complete together the
// moment phase changes — matching how the workflow actually behaves.
function currentStepIndex(phase: string, status: string): number {
  if (status === 'closed') return STEPS.length;
  switch (phase) {
    case 'Intake':
      return 1;
    case 'ASHK Check':
    case 'Property Valuation':
      return 3;
    case 'Legal Review':
      return 4;
    case 'Final Approval':
      return 5;
    default:
      return 1;
  }
}

export function CitizenTrackingTimeline({ phase, status }: CitizenTrackingTimelineProps) {
  const current = currentStepIndex(phase, status);

  return (
    <ol className="citizen-tracking-timeline">
      {STEPS.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <li
            key={step}
            className={[
              'citizen-tracking-timeline__step',
              isDone && 'citizen-tracking-timeline__step--done',
              isCurrent && 'citizen-tracking-timeline__step--current',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--step-delay': `${index * 70}ms` } as CSSProperties}
          >
            <span className="citizen-tracking-timeline__marker" aria-hidden="true">
              {isDone ? '✓' : '⏳'}
            </span>
            <span className="citizen-tracking-timeline__label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
