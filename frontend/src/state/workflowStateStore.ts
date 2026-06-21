import { createContext } from 'react';

// A plain mutable bag of values, not React state itself — see
// WorkflowStateProvider.tsx for why. Keyed by an arbitrary string each
// usePersistentState() call picks (typically "<page>:<field>").
export interface WorkflowStateStore {
  values: Record<string, unknown>;
}

export const WorkflowStateContext = createContext<WorkflowStateStore | null>(null);
