import { useEffect, useState } from 'react';
import { getPropertyAlerts } from '../services/propertyAlertService';
import type { PropertyAlert } from '../services/propertyAlertService';

interface UsePropertyAlertsResult {
  alerts: PropertyAlert[];
  loading: boolean;
  error: string | null;
}

interface FetchResult {
  propertyNumber: string;
  alerts?: PropertyAlert[];
  error?: string;
}

export function usePropertyAlerts(propertyNumber: string | null): UsePropertyAlertsResult {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!propertyNumber) return;

    let isMounted = true;

    getPropertyAlerts(propertyNumber)
      .then((alerts) => {
        if (isMounted) setResult({ propertyNumber, alerts });
      })
      .catch((err) => {
        if (isMounted) {
          setResult({
            propertyNumber,
            error: err instanceof Error ? err.message : 'Could not load property alerts.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyNumber]);

  const current = result && result.propertyNumber === propertyNumber ? result : null;

  return {
    alerts: current?.alerts ?? [],
    loading: Boolean(propertyNumber) && !current,
    error: current?.error ?? null,
  };
}
