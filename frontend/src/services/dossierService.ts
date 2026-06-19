import { dossiers } from '../data/dossiers';
import type { Dossier } from '../types/dossier';

// Placeholder implementation backed by local data. Swap the bodies below for
// real HTTP calls (e.g. via fetch/axios against an API base URL) once the
// backend is available — the signatures are designed to stay stable.

export async function getDossiers(): Promise<Dossier[]> {
  return Promise.resolve(dossiers);
}

export async function getDossierById(id: string): Promise<Dossier | undefined> {
  return Promise.resolve(dossiers.find((dossier) => dossier.id === id));
}
