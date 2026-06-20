import { useCallback, useState } from 'react';
import { getLegalImpactGraph } from '../services/legalImpactService';
import type { LegalImpactGraphResult } from '../services/legalImpactService';

interface UseLegalImpactGraphResult {
  impact: LegalImpactGraphResult | null;
  loading: boolean;
  error: string | null;
  search: (legalChangeId: string) => void;
}

export function useLegalImpactGraph(): UseLegalImpactGraphResult {
  const [impact, setImpact] = useState<LegalImpactGraphResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback((legalChangeId: string) => {
    setLoading(true);
    setError(null);

    getLegalImpactGraph(legalChangeId)
      .then((data) => setImpact(data))
      .catch((err) => {
        setImpact(null);
        setError(err instanceof Error ? err.message : 'Could not load legal impact data.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { impact, loading, error, search };
}
