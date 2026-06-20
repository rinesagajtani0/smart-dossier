import type { CaseStatus } from '../types/dossier';

const ALBANIAN_MONTHS_SHORT = [
  'Jan',
  'Shk',
  'Mar',
  'Pri',
  'Maj',
  'Qer',
  'Korr',
  'Gush',
  'Sht',
  'Tet',
  'Nën',
  'Dhj',
];

// Browser Intl 'sq-AL' support is inconsistent (some Chromium builds
// silently fall back to English), so Albanian dates are formatted manually
// here for reliability — day-month-year, the Albanian convention.
export function formatAlbanianDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${ALBANIAN_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDate(value: string | null): string {
  if (!value) return 'No deadline';
  return formatAlbanianDate(value);
}

export function isOverdue(deadline: string | null, status: CaseStatus, now: Date = new Date()): boolean {
  if (!deadline || status === 'closed') return false;
  return new Date(deadline).getTime() < now.getTime();
}
