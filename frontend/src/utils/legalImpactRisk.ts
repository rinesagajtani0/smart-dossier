export type LegalImpactRiskTier = 'low' | 'medium' | 'high' | 'critical';

export function riskTierFromScore(score: number): LegalImpactRiskTier {
  if (score >= 76) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  return 'low';
}
