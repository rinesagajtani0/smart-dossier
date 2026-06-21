import { useCallback, useEffect, useState } from 'react';
import { predictDossierDelay } from '../services/dossierService';
import type { DelayPrediction } from '../services/dossierService';
import { usePersistentState } from '../state/usePersistentState';

interface UseDelayPredictionResult {
  prediction: DelayPrediction | null;
  loading: boolean;
  error: string | null;
  search: (id: string) => void;
}

export function useDelayPrediction(initialId: string): UseDelayPredictionResult {
  const [prediction, setPrediction] = usePersistentState<DelayPrediction | null>('delay-prediction:prediction', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Already have a result (either from a previous visit to this page, or
    // restored from the persisted store on remount) — nothing to fetch.
    if (!initialId || prediction) return;

    let isMounted = true;

    function load() {
      setLoading(true);
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

    predictDossierDelay(id)
      .then((data) => setPrediction(data))
      .catch((err) => {
        setPrediction(null);
        setError(err instanceof Error ? err.message : 'Could not load delay prediction.');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { prediction, loading, error, search };
}
