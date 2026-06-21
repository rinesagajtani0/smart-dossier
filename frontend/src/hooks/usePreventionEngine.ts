import { useEffect, useMemo, useState } from 'react';
import { predictDossierDelay, updateDossier } from '../services/dossierService';
import type { DelayPrediction } from '../services/dossierService';
import type { PreventDelayPlan } from './usePreventDelay';
import { usePersistentState } from '../state/usePersistentState';
import { RISK_PROBABILITY, riskLevelFromProbability } from '../utils/riskProbability';
import type { RiskLevel } from '../types/dossier';

export type PreventionTaskStatus = 'pending' | 'in-progress' | 'completed';
export type PreventionTaskKind = 'missing-document' | 'verification' | 'notification';
export type PreventionSeverity = 'high' | 'medium' | 'low';

export interface PreventionAction {
  label: string;
  type: string;
}

export interface PreventionTask {
  id: string;
  title: string;
  kind: PreventionTaskKind;
  severity: PreventionSeverity;
  documentName: string | null;
  action: string;
  impact: string;
  riskImpactPercent: number;
  primaryAction: PreventionAction;
  secondaryAction: PreventionAction;
}

// Every checklist line from usePreventDelay is one of three shapes
// ("Request X" / "Verify X" / "Notify applicant"). Missing-document tasks
// also clear dossier fields server-side; all completed tasks contribute their
// prevention impact to the projected risk shown in the simulator.
function buildTasks(plan: PreventDelayPlan): PreventionTask[] {
  return plan.checklist.map((item) => {
    if (item.startsWith('Request ')) {
      const doc = item.replace('Request ', '');
      return {
        id: item,
        title: `Missing ${doc}`,
        kind: 'missing-document',
        severity: 'high',
        documentName: doc,
        action: item,
        impact: 'Prevents the most common cause of a hold at this phase.',
        riskImpactPercent: 12,
        primaryAction: { label: 'Request Missing Document', type: 'request-document' },
        secondaryAction: { label: 'Escalate to Manager', type: 'escalate' },
      };
    }

    if (item.startsWith('Verify ')) {
      const doc = item.replace('Verify ', '');
      return {
        id: item,
        title: `${doc} Verification Needed`,
        kind: 'verification',
        severity: 'medium',
        documentName: null,
        action: item,
        impact: 'Reduces the chance of a late-stage compliance hold.',
        riskImpactPercent: 6,
        primaryAction: { label: 'Request Institution Verification', type: 'request-verification' },
        secondaryAction: { label: 'Assign Staff Review', type: 'assign-staff' },
      };
    }

    return {
      id: item,
      title: item,
      kind: 'notification',
      severity: 'low',
      documentName: null,
      action: item,
      impact: 'Keeps the applicant informed and reduces follow-up delay.',
      riskImpactPercent: 3,
      primaryAction: { label: 'Send Citizen Notification', type: 'notify-citizen' },
      secondaryAction: { label: 'Schedule Follow-Up Review', type: 'schedule-followup' },
    };
  });
}

const RESOLVE_DELAY_MS = 700;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UsePreventionEngineResult {
  tasks: PreventionTask[];
  statuses: Record<string, PreventionTaskStatus>;
  baseline: DelayPrediction | null;
  live: DelayPrediction | null;
  baselineRiskPercent: number | null;
  projectedRiskPercent: number | null;
  projectedRisk: RiskLevel | null;
  resolveTask: (taskId: string) => void;
  resolvingTaskId: string | null;
  engineError: string | null;
  documentsRecovered: number;
}

export function usePreventionEngine(dossierId: string, plan: PreventDelayPlan | null): UsePreventionEngineResult {
  const tasks = useMemo(() => (plan ? buildTasks(plan) : []), [plan]);

  const [statuses, setStatuses] = usePersistentState<Record<string, PreventionTaskStatus>>(
    `prevent-delay:tasks:${dossierId}`,
    {},
  );
  const [resolvedDocs, setResolvedDocs] = usePersistentState<string[]>(
    `prevent-delay:resolved-docs:${dossierId}`,
    [],
  );
  const [baseline, setBaseline] = usePersistentState<DelayPrediction | null>(
    `prevent-delay:baseline:${dossierId}`,
    null,
  );
  const [live, setLive] = usePersistentState<DelayPrediction | null>(`prevent-delay:live:${dossierId}`, null);
  const [resolvingTaskId, setResolvingTaskId] = useState<string | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  const completedRiskImpact = useMemo(
    () =>
      tasks.reduce(
        (total, task) => (statuses[task.id] === 'completed' ? total + task.riskImpactPercent : total),
        0,
      ),
    [statuses, tasks],
  );
  const baselineRiskPercent = baseline ? RISK_PROBABILITY[baseline.risk] : null;
  const projectedRiskPercent =
    baseline && live
      ? Math.max(
          0,
          Math.min(RISK_PROBABILITY[live.risk], RISK_PROBABILITY[baseline.risk] - completedRiskImpact),
        )
      : null;
  const projectedRisk = projectedRiskPercent !== null ? riskLevelFromProbability(projectedRiskPercent) : null;

  useEffect(() => {
    if (!plan || baseline) return;

    let mounted = true;
    predictDossierDelay(dossierId)
      .then((prediction) => {
        if (!mounted) return;
        setBaseline(prediction);
        setLive(prediction);
      })
      .catch(() => {
        // No real baseline available — the simulator section just stays
        // hidden until one loads; nothing else on the page depends on it.
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossierId, plan]);

  function resolveTask(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || !plan || statuses[taskId] === 'completed' || resolvingTaskId) return;

    setEngineError(null);
    setResolvingTaskId(taskId);
    setStatuses((prev) => ({ ...prev, [taskId]: 'in-progress' }));

    (async () => {
      await wait(RESOLVE_DELAY_MS);

      // Non-document tasks have no dossier field to clear. Marking them
      // completed updates the projected risk through completedRiskImpact.
      if (task.kind !== 'missing-document' || !task.documentName) {
        setStatuses((prev) => ({ ...prev, [taskId]: 'completed' }));
        setResolvingTaskId(null);
        return;
      }

      try {
        const attemptedDocs = [...resolvedDocs, task.documentName];
        const stillMissing = plan.missingDocuments.filter((doc) => !attemptedDocs.includes(doc));
        const updated = await updateDossier(dossierId, { missingFields: stillMissing });

        // Trust what the server actually stored, not the optimistic patch —
        // the existing legal-adaptation engine can re-add a document right
        // back (e.g. one an active regulatory update still requires), and
        // this must not claim success when that happens.
        const actuallyResolved = plan.missingDocuments.filter((doc) => !updated.missingFields.includes(doc));
        setResolvedDocs(actuallyResolved);

        const fresh = await predictDossierDelay(dossierId);
        setLive(fresh);

        if (updated.missingFields.includes(task.documentName)) {
          setEngineError(
            `${task.documentName} is still required by an active legal/regulatory update and could not be cleared automatically — escalate to a manager.`,
          );
          setStatuses((prev) => ({ ...prev, [taskId]: 'pending' }));
        } else {
          setStatuses((prev) => ({ ...prev, [taskId]: 'completed' }));
        }
      } catch (err) {
        setEngineError(err instanceof Error ? err.message : 'Could not recalculate delay risk.');
        setStatuses((prev) => ({ ...prev, [taskId]: 'pending' }));
      }

      setResolvingTaskId(null);
    })();
  }

  return {
    tasks,
    statuses,
    baseline,
    live,
    baselineRiskPercent,
    projectedRiskPercent,
    projectedRisk,
    resolveTask,
    resolvingTaskId,
    engineError,
    documentsRecovered: resolvedDocs.length,
  };
}
