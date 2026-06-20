import { useCallback, useEffect, useState } from 'react';

// There's no backend concept of a "submitted" application yet — a dossier
// is just "open" the moment it's created, before any document is even
// uploaded. Tracking the citizen's explicit submission step client-side
// (rather than overloading Dossier.status, which staff/manager queries
// already filter on literally as "open") keeps this purely a frontend
// workflow gate, as required, with no backend changes.
function storageKey(dossierId: string): string {
  return `smart-dossier:application-submitted:${dossierId}`;
}

// Plain (non-hook) check, for scanning a whole dossier list — e.g. the
// staff queue filtering many dossiers down to "submitted" ones, where
// calling a hook per dossier isn't possible.
export function isApplicationSubmitted(dossierId: string): boolean {
  return localStorage.getItem(storageKey(dossierId)) === 'true';
}

interface UseApplicationSubmissionResult {
  submitted: boolean;
  submit: () => void;
}

export function useApplicationSubmission(dossierId: string): UseApplicationSubmissionResult {
  const [submitted, setSubmitted] = useState(() => isApplicationSubmitted(dossierId));

  useEffect(() => {
    setSubmitted(isApplicationSubmitted(dossierId));
  }, [dossierId]);

  const submit = useCallback(() => {
    localStorage.setItem(storageKey(dossierId), 'true');
    setSubmitted(true);
  }, [dossierId]);

  return { submitted, submit };
}
