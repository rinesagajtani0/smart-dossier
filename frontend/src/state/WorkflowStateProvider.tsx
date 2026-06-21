import { useState } from 'react';
import type { ReactNode } from 'react';
import { WorkflowStateContext } from './workflowStateStore';
import type { WorkflowStateStore } from './workflowStateStore';

// Mounted once, above <BrowserRouter> in App.tsx — exactly like AuthProvider
// for `role`. Routing only swaps the matched <Route>'s element; it never
// unmounts this provider, so the store below survives every client-side
// navigation. Unlike AuthProvider, this deliberately does NOT touch
// localStorage/sessionStorage: the requirement is "persists while the app
// is open, resets on a full browser refresh" — a plain object recreated
// from scratch on every page load already does exactly that, with no extra
// storage plumbing. Created via useState's lazy initializer (not useRef)
// so the value is never read from a ref during render.
export function WorkflowStateProvider({ children }: { children: ReactNode }) {
  const [store] = useState<WorkflowStateStore>(() => ({ values: {} }));

  return <WorkflowStateContext.Provider value={store}>{children}</WorkflowStateContext.Provider>;
}
