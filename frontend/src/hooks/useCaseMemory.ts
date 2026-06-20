import { useCallback, useEffect, useState } from 'react';
import { getCaseMemory } from '../services/dossierService';
import type { SimilarCase } from '../services/dossierService';

interface UseCaseMemoryResult {
  cases: SimilarCase[];
  loading: boolean;
  error: string | null;
  search: (id: string) => void;
}

export function useCaseMemory(initialId: string): UseCaseMemoryResult {
  const [cases, setCases] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getCaseMemory(initialId)
      .then((data) => {
        if (isMounted) setCases(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load similar cases.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useCallback((id: string) => {
    setLoading(true);
    setError(null);

    getCaseMemory(id)
      .then((data) => setCases(data))
      .catch((err) => {
        setCases([]);
        setError(err instanceof Error ? err.message : 'Could not load similar cases.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { cases, loading, error, search };
}
