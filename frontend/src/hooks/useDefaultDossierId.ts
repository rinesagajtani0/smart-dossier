import { useEffect, useState } from 'react';
import { getDossiers } from '../services/dossierService';

export function useDefaultDossierId(initialId?: string) {
  const [dossierId, setDossierId] = useState(initialId ?? '');
  const [hint, setHint] = useState(
    initialId ? `Using dossier ${initialId} prepared from your generated procedure.` : 'Loading available dossier...',
  );

  useEffect(() => {
    // A dossier prepared by the Procedure Generator already has an id —
    // skip the "pick the first available dossier" fallback in that case.
    if (initialId) return;

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
  }, [initialId]);

  return { dossierId, setDossierId, hint };
}
