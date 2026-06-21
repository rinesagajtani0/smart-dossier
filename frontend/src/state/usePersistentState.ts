import { useContext, useState } from 'react';
import type { SetStateAction } from 'react';
import { WorkflowStateContext } from './workflowStateStore';

// Same shape as useState's [value, setValue] — usually a one-line swap for
// whatever local state was being lost on navigation. Also accepts the
// functional updater form (setValue(prev => ...)), same as useState,
// since some callers (e.g. useMultiDocumentUpload) need it to avoid
// stale-closure bugs in async callbacks.
//
// `key` must be unique per field across the whole app (the convention used
// everywhere this is called is "<page>:<field>"); two components using the
// same key would share one slot, which is occasionally useful (see
// useDefaultDossierId) but is the caller's choice, not a default.
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: SetStateAction<T>) => void, () => void] {
  const store = useContext(WorkflowStateContext);
  if (!store) {
    throw new Error('usePersistentState must be used within a WorkflowStateProvider');
  }

  // Read-only at init time — writing the store during render (even inside
  // a lazy initializer) isn't safe under React's rules. If the key was
  // never written, this falls back to initialValue every time, which is
  // behaviorally identical to seeding it upfront.
  const [value, setValue] = useState<T>(() => (key in store.values ? (store.values[key] as T) : initialValue));

  function update(next: SetStateAction<T>) {
    setValue((current) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next;
      store.values[key] = resolved;
      return resolved;
    });
  }

  function reset() {
    update(initialValue);
  }

  return [value, update, reset];
}
