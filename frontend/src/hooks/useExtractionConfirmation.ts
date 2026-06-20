import { useCallback, useEffect, useState } from 'react';

// Mirrors useApplicationSubmission.ts: there's no backend "extraction
// confirmed" concept, and staff confirmation is a frontend review gate,
// not a new dossier field — tracked client-side, separate from the
// citizen's "submitted" flag so the two steps can't be conflated.
function storageKey(dossierId: string): string {
  return `smart-dossier:extraction-confirmed:${dossierId}`;
}

export function isExtractionConfirmed(dossierId: string): boolean {
  return localStorage.getItem(storageKey(dossierId)) === 'true';
}

interface UseExtractionConfirmationResult {
  confirmed: boolean;
  confirm: () => void;
}

export function useExtractionConfirmation(dossierId: string): UseExtractionConfirmationResult {
  const [confirmed, setConfirmed] = useState(() => isExtractionConfirmed(dossierId));

  useEffect(() => {
    setConfirmed(isExtractionConfirmed(dossierId));
  }, [dossierId]);

  const confirm = useCallback(() => {
    localStorage.setItem(storageKey(dossierId), 'true');
    setConfirmed(true);
  }, [dossierId]);

  return { confirmed, confirm };
}
