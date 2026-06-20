import { request } from './apiClient';

export interface ProcessStep {
  id: number;
  processType: string;
  phase: string;
  institution: string;
  criticalPoint: boolean;
  expectedDays: number;
  nextPhase: string | null;
  requiredDocuments: string[];
}

interface ApiProcessStep extends ProcessStep {
  requiredDocumentsJson: string;
}

export async function getProcessSteps(processType: string): Promise<ProcessStep[]> {
  const steps = await request<ApiProcessStep[]>(`/process/${processType}`);
  return steps.map((step) => ({
    id: step.id,
    processType: step.processType,
    phase: step.phase,
    institution: step.institution,
    criticalPoint: step.criticalPoint,
    expectedDays: step.expectedDays,
    nextPhase: step.nextPhase,
    requiredDocuments: step.requiredDocuments,
  }));
}
