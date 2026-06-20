import { useEffect, useState } from 'react';
import { getManagerDashboard } from '../services/roleService';
import type { ManagerDashboard } from '../services/roleService';

interface UseManagerDashboardResult {
  managerDashboard: ManagerDashboard | null;
  loading: boolean;
  error: string | null;
}

export function useManagerDashboard(): UseManagerDashboardResult {
  const [managerDashboard, setManagerDashboard] = useState<ManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getManagerDashboard()
      .then((data) => {
        if (isMounted) setManagerDashboard(data);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load manager dashboard data.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { managerDashboard, loading, error };
}
