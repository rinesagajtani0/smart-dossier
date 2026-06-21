import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/dashboardService';
import { getProcessSteps } from '../services/processService';

export interface DelayDashboardStats {
  activeDossiers: number;
  highRiskPercent: number;
  averageProcessingDays: number;
  byPhase: Record<string, number>;
  byRisk: Record<string, number>;
}

const FALLBACK_STATS: DelayDashboardStats = {
  activeDossiers: 0,
  highRiskPercent: 0,
  averageProcessingDays: 0,
  byPhase: {},
  byRisk: {},
};

// Backing data for the dashboard-style stat cards/charts at the top of the
// Delay Prediction page. Everything here is a real aggregate (dashboard
// totals, the seeded property-registration baseline) — nothing fabricated,
// so the "AI dashboard" framing doesn't drift into showing made-up numbers.
export function useDelayDashboardStats() {
  const [stats, setStats] = useState<DelayDashboardStats>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([getDashboardStats(), getProcessSteps('property-registration')])
      .then(([dashboard, steps]) => {
        if (!mounted) return;
        const averageProcessingDays = steps.reduce((sum, step) => sum + step.expectedDays, 0);
        const highRiskPercent = dashboard.totalDossiers
          ? Math.round((dashboard.highRisk / dashboard.totalDossiers) * 100)
          : 0;

        setStats({
          activeDossiers: dashboard.totalDossiers,
          highRiskPercent,
          averageProcessingDays,
          byPhase: dashboard.byPhase,
          byRisk: dashboard.byRisk,
        });
      })
      .catch(() => {
        if (mounted) setStats(FALLBACK_STATS);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading };
}
