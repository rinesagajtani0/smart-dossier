// Lightweight in-page pub/sub so any mounted dashboard/list hook can refetch
// the moment a dossier changes, without polling or a backend push channel
// (there isn't one, and we're not adding one). Scoped to this document only
// — fine here since every role view in this app lives in one tab/session,
// switched via the "Viewing as" control rather than separate logins.
const target = new EventTarget();
const DOSSIER_UPDATED_EVENT = 'dossier-updated';

export function emitDossierUpdated(dossierId?: string): void {
  target.dispatchEvent(new CustomEvent(DOSSIER_UPDATED_EVENT, { detail: { dossierId } }));
}

export function subscribeToDossierUpdates(listener: () => void): () => void {
  const handler = () => listener();
  target.addEventListener(DOSSIER_UPDATED_EVENT, handler);
  return () => target.removeEventListener(DOSSIER_UPDATED_EVENT, handler);
}
