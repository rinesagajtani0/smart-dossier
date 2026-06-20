import { useCallback, useEffect, useState } from 'react';
import { getLegalImpactGraph } from '../services/legalImpactService';
import type { LegalImpactGraphResult } from '../services/legalImpactService';

interface UseLegalImpactGraphResult {
  impact: LegalImpactGraphResult | null;
  loading: boolean;
  error: string | null;
  search: (id: string) => void;
}

export function useLegalImpactGraph(initialId: string): UseLegalImpactGraphResult {
  const [impact, setImpact] = useState<LegalImpactGraphResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getLegalImpactGraph(initialId)
      .then((data) => {
        if (isMounted) setImpact(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load legal impact data.');
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

    getLegalImpactGraph(id)
      .then((data) => setImpact(data))
      .catch((err) => {
        setImpact(null);
        setError(err instanceof Error ? err.message : 'Could not load legal impact data.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { impact, loading, error, search };
}
