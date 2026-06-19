import type { Dossier } from '../types/dossier';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isDelayed(dossier: Dossier, now: Date = new Date()): boolean {
  if (dossier.phase === 'completed') return false;
  return new Date(dossier.deadline).getTime() < now.getTime();
}

export function isDueThisWeek(dossier: Dossier, now: Date = new Date()): boolean {
  if (dossier.phase === 'completed') return false;
  const deadline = new Date(dossier.deadline).getTime();
  return deadline >= now.getTime() && deadline <= now.getTime() + WEEK_MS;
}

export interface DossierStats {
  total: number;
  highRisk: number;
  delayed: number;
  dueThisWeek: number;
}

export function getDossierStats(dossiers: Dossier[], now: Date = new Date()): DossierStats {
  return {
    total: dossiers.length,
    highRisk: dossiers.filter((d) => d.riskLevel === 'high').length,
    delayed: dossiers.filter((d) => isDelayed(d, now)).length,
    dueThisWeek: dossiers.filter((d) => isDueThisWeek(d, now)).length,
  };
}
