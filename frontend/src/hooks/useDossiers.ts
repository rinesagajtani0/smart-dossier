import { useEffect, useState } from 'react';
import { getDossiers } from '../services/dossierService';
import type { Dossier } from '../types/dossier';

interface UseDossiersResult {
  dossiers: Dossier[];
  loading: boolean;
  error: string | null;
}

export function useDossiers(): UseDossiersResult {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDossiers()
      .then((data) => {
        if (isMounted) setDossiers(data);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load dossiers.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { dossiers, loading, error };
}
