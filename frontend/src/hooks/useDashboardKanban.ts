import { useEffect, useState } from 'react';
import { getDashboardKanban } from '../services/dashboardService';
import { subscribeToDossierUpdates } from '../services/dossierEvents';
import type { KanbanColumns } from '../types/dossier';

interface UseDashboardKanbanResult {
  columns: KanbanColumns | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardKanban(): UseDashboardKanbanResult {
  const [columns, setColumns] = useState<KanbanColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    function load(showLoading: boolean) {
      if (showLoading) setLoading(true);
      getDashboardKanban()
        .then((data) => {
          if (isMounted) setColumns(data);
        })
        .catch(() => {
          if (isMounted) setError('Failed to load phase overview.');
        })
        .finally(() => {
          if (isMounted && showLoading) setLoading(false);
        });
    }

    load(true);
    // Re-fetch silently whenever a dossier changes elsewhere in the app —
    // keeps Active Dossiers / bottlenecks live without a page refresh.
    const unsubscribe = subscribeToDossierUpdates(() => load(false));

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { columns, loading, error };
}
