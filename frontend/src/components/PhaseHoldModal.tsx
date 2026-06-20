import { useState } from 'react';
import type { LegalChangeImpact } from '../types/dossier';
import './PhaseHoldModal.css';

interface PhaseHoldModalProps {
  legalChangeImpact: LegalChangeImpact | null;
}

export function PhaseHoldModal({ legalChangeImpact }: PhaseHoldModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const isBlocked = legalChangeImpact?.systemAdaptation.processAction === 'hold-before-next-phase';

  if (!isBlocked || acknowledged) {
    return null;
  }

  return (
    <div className="phase-hold-modal__overlay">
      <div
        className="phase-hold-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="phase-hold-modal-title"
        aria-describedby="phase-hold-modal-message"
      >
        <span className="phase-hold-modal__icon" aria-hidden="true">
          ⚖
        </span>
        <h2 id="phase-hold-modal-title" className="phase-hold-modal__title">
          Phase Advancement Blocked
        </h2>
        <p id="phase-hold-modal-message" className="phase-hold-modal__message">
          Phase advancement blocked until legal review is completed.
        </p>
        <button type="button" className="phase-hold-modal__button" onClick={() => setAcknowledged(true)}>
          I Understand
        </button>
      </div>
    </div>
  );
}
