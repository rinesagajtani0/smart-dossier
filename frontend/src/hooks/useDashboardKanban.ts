import { useEffect, useState } from 'react';
import { getDashboardKanban } from '../services/dashboardService';
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

    getDashboardKanban()
      .then((data) => {
        if (isMounted) setColumns(data);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load phase overview.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { columns, loading, error };
}
