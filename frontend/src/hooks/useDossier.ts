import { useEffect, useState } from 'react';
import { getDossierById } from '../services/dossierService';
import type { Dossier } from '../types/dossier';

interface UseDossierResult {
  dossier: Dossier | undefined;
  loading: boolean;
  error: string | null;
}

interface FetchResult {
  id: string;
  dossier?: Dossier;
  error?: string;
}

export function useDossier(id: string | undefined): UseDossierResult {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    getDossierById(id)
      .then((dossier) => {
        if (isMounted) setResult({ id, dossier });
      })
      .catch(() => {
        if (isMounted) setResult({ id, error: 'Failed to load dossier.' });
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const current = result && result.id === id ? result : null;

  return {
    dossier: current?.dossier,
    loading: Boolean(id) && !current,
    error: current?.error ?? null,
  };
}
