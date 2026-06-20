import { useEffect, useState } from 'react';
import { getDossierSnapshot } from '../services/dossierService';
import type { DossierSnapshot } from '../services/dossierService';

interface UseDossierSnapshotResult {
  snapshot: DossierSnapshot | null;
  loading: boolean;
  error: string | null;
}

interface FetchResult {
  dossierId: string;
  snapshot?: DossierSnapshot;
  error?: string;
}

export function useDossierSnapshot(dossierId: string): UseDossierSnapshotResult {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDossierSnapshot(dossierId)
      .then((snapshot) => {
        if (isMounted) setResult({ dossierId, snapshot });
      })
      .catch((err) => {
        if (isMounted) {
          setResult({ dossierId, error: err instanceof Error ? err.message : 'Could not load dossier details.' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dossierId]);

  const current = result && result.dossierId === dossierId ? result : null;

  return {
    snapshot: current?.snapshot ?? null,
    loading: !current,
    error: current?.error ?? null,
  };
}
