import { useEffect, useState } from 'react';
import { getDossiers } from '../services/dossierService';
import { usePersistentState } from '../state/usePersistentState';

// `pageKey` scopes persistence per page — Case Memory, Prevent Delay, and
// Delay Prediction each call this hook independently and shouldn't share
// one dossier ID slot just because they use the same hook.
export function useDefaultDossierId(pageKey: string, initialId?: string) {
  const [dossierId, setDossierId] = usePersistentState(`${pageKey}:dossierId`, initialId ?? '');
  const [hint, setHint] = useState(() => {
    if (initialId) return `Using dossier ${initialId} prepared from your generated procedure.`;
    if (dossierId) return `Using dossier ID ${dossierId}.`;
    return 'Loading available dossier...';
  });

  useEffect(() => {
    // A dossier prepared by the Procedure Generator already has an id, and
    // a persisted/already-entered dossierId means the user (or an earlier
    // visit to this page) already chose one — skip the "pick the first
    // available dossier" fallback in both cases, so navigating back here
    // doesn't clobber what was already there.
    if (initialId || dossierId) return;

    let mounted = true;

    getDossiers()
      .then((dossiers) => {
        if (!mounted) return;
        const firstId = dossiers[0]?.id ?? '';
        setDossierId(firstId);
        setHint(firstId ? `Using available dossier ID ${firstId}.` : 'No dossiers are available yet.');
      })
      .catch(() => {
        if (mounted) setHint('Enter an existing dossier ID.');
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  return { dossierId, setDossierId, hint };
}
