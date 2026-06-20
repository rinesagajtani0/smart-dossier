import { useCallback, useState } from 'react';
import { generateDossierLetter, getDossierSnapshot } from '../services/dossierService';
import { getProcessSteps } from '../services/processService';
import type { RiskLevel } from '../types/dossier';

export interface PreventDelayPlan {
  currentRisk: RiskLevel;
  updatedRisk: RiskLevel;
  checklist: string[];
  letter: {
    content: string;
    createdAt: string;
  };
}

interface UsePreventDelayResult {
  plan: PreventDelayPlan | null;
  loading: boolean;
  error: string | null;
  preventDelay: (id: string) => void;
}

// Backend has no concept of "risk after intervention" — this is a
// presentational projection of the improvement taking action would have,
// not a value the server computed.
const RISK_DOWNGRADE: Record<RiskLevel, RiskLevel> = {
  high: 'medium',
  medium: 'low',
  low: 'low',
};

export function usePreventDelay(): UsePreventDelayResult {
  const [plan, setPlan] = useState<PreventDelayPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preventDelay = useCallback((id: string) => {
    setLoading(true);
    setError(null);
    setPlan(null);

    Promise.all([getDossierSnapshot(id), generateDossierLetter(id)])
      .then(async ([snapshot, letter]) => {
        const steps = await getProcessSteps(snapshot.processType);
        const currentStep = steps.find((step) => step.phase === snapshot.phase);
        const requiredDocuments = currentStep?.requiredDocuments ?? [];
        const outstanding = requiredDocuments.filter((doc) => !snapshot.missingFields.includes(doc));

        const checklist = [
          ...snapshot.missingFields.map((field) => `Request ${field}`),
          ...outstanding.map((doc) => `Verify ${doc}`),
          'Notify applicant',
        ];

        setPlan({
          currentRisk: snapshot.riskLevel,
          updatedRisk: RISK_DOWNGRADE[snapshot.riskLevel],
          checklist,
          letter: { content: letter.content, createdAt: letter.createdAt },
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not generate the prevent-delay plan.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { plan, loading, error, preventDelay };
}
