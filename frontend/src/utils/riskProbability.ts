import type { RiskLevel } from '../types/dossier';

// The backend only returns a risk tier (low/medium/high), not the numeric
// score that produced it — this is the one presentational mapping shared by
// every page that needs to show a delay-probability percentage (Delay
// Prediction, Prevent Delay). Keeping it in one place means both pages stay
// in sync by construction instead of by convention.
export const RISK_PROBABILITY: Record<RiskLevel, number> = {
  low: 22,
  medium: 55,
  high: 82,
};

export function riskLevelFromProbability(percent: number): RiskLevel {
  if (percent >= 70) return 'high';
  if (percent >= 40) return 'medium';
  return 'low';
}

export const RISK_BADGE_LABEL: Record<RiskLevel, string> = {
  low: '🟢 Low Risk',
  medium: '🟡 Medium Risk',
  high: '🔴 High Risk',
};

// Parses the upper bound out of a "predictedDelay" string like "10-17 days"
// or "0-4 days" — used to derive a real "estimated completion" date and to
// diff before/after predictions into a days-saved number.
export function parseUpperBoundDays(predictedDelay: string): number | null {
  const matches = [...predictedDelay.matchAll(/\d+/g)].map((match) => Number(match[0]));
  return matches.length ? matches[matches.length - 1] : null;
}

export function estimateCompletionDate(predictedDelay: string): string | null {
  const days = parseUpperBoundDays(predictedDelay);
  if (days === null) return null;

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
