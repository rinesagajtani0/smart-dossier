import { useCallback, useEffect, useState } from 'react';
import { getCaseMemory } from '../services/dossierService';
import type { SimilarCase } from '../services/dossierService';
import { usePersistentState } from '../state/usePersistentState';

interface UseCaseMemoryResult {
  cases: SimilarCase[];
  loading: boolean;
  error: string | null;
  search: (id: string) => void;
}

export function useCaseMemory(initialId: string): UseCaseMemoryResult {
  const [cases, setCases] = usePersistentState<SimilarCase[]>('case-memory:cases', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Already have results (a previous visit, or restored on remount) —
    // nothing to fetch.
    if (!initialId || cases.length > 0) return;

    let isMounted = true;

    function load() {
      setLoading(true);
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
    }

    load();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cases, loading, error, search };
}
