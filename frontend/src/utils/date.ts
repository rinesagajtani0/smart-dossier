import type { CaseStatus } from '../types/dossier';

export function formatShortDate(value: string | null): string {
  if (!value) return 'No deadline';

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

export function isOverdue(deadline: string | null, status: CaseStatus, now: Date = new Date()): boolean {
  if (!deadline || status === 'closed') return false;
  return new Date(deadline).getTime() < now.getTime();
}
