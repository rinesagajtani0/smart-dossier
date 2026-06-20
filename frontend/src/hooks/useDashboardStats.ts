import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { subscribeToDossierUpdates } from '../services/dossierEvents';
import type { DashboardStats } from '../types/dossier';

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    function load(showLoading: boolean) {
      if (showLoading) setLoading(true);
      getDashboardStats()
        .then((data) => {
          if (isMounted) setStats(data);
        })
        .catch(() => {
          if (isMounted) setError('Failed to load dashboard stats.');
        })
        .finally(() => {
          if (isMounted && showLoading) setLoading(false);
        });
    }

    load(true);
    // Re-fetch silently (no loading flicker) whenever any dossier changes
    // elsewhere in the app — e.g. staff confirming NLP extraction — so this
    // stays live without a manual page refresh.
    const unsubscribe = subscribeToDossierUpdates(() => load(false));

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { stats, loading, error };
}
