import { useCallback, useEffect, useState } from 'react';
import { predictDossierDelay } from '../services/dossierService';
import type { DelayPrediction } from '../services/dossierService';

interface UseDelayPredictionResult {
  prediction: DelayPrediction | null;
  loading: boolean;
  error: string | null;
  search: (id: string) => void;
}

export function useDelayPrediction(initialId: string): UseDelayPredictionResult {
  const [prediction, setPrediction] = useState<DelayPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    predictDossierDelay(initialId)
      .then((data) => {
        if (isMounted) setPrediction(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Could not load delay prediction.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialId]);

  const search = useCallback((id: string) => {
    setLoading(true);
    setError(null);

    predictDossierDelay(id)
      .then((data) => setPrediction(data))
      .catch((err) => {
        setPrediction(null);
        setError(err instanceof Error ? err.message : 'Could not load delay prediction.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { prediction, loading, error, search };
}
