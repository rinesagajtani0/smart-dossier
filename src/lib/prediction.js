import { parseJson } from "./json.js";

function riskFromScore(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function predictDelay(dossier, similarCases, processSteps) {
  const missing = parseJson(dossier.missingFieldsJson, []);
  const step = processSteps.find((item) => item.phase === dossier.phase);
  const delayedMatches = similarCases.filter((item) => item.caseHistory?.outcome === "delayed");
  const avgDelay = delayedMatches.length
    ? Math.round(delayedMatches.reduce((sum, item) => sum + item.caseHistory.delayDays, 0) / delayedMatches.length)
    : 0;

  let score = 15;
  if (missing.length) score += Math.min(35, missing.length * 12);
  if (step?.criticalPoint) score += 20;
  if (delayedMatches.length) score += Math.min(30, delayedMatches.length * 10);
  if (dossier.deadline && new Date(dossier.deadline).getTime() - Date.now() < 4 * 24 * 60 * 60 * 1000) score += 15;

  const risk = riskFromScore(score);
  const likelyBlockage = step?.criticalPoint ? step.phase : delayedMatches[0]?.phase || dossier.phase;
  const mainMissing = missing[0] || "supporting documentation";
  const predictedDelay = avgDelay ? `${Math.max(3, avgDelay - 3)}-${avgDelay + 4} days` : risk === "high" ? "7-12 days" : "0-4 days";

  return {
    risk,
    predictedDelay,
    likelyBlockage,
    reason: delayedMatches.length
      ? `${delayedMatches.length} similar delayed case(s) had related issues, especially ${delayedMatches[0].caseHistory.delayReason || mainMissing}.`
      : missing.length
        ? `The dossier is missing ${missing.join(", ")}.`
        : "No strong delay pattern was found in similar cases.",
    recommendedAction: missing.length
      ? `Request ${mainMissing} today and attach it before the next phase.`
      : `Verify the current phase with ${dossier.institution} and keep the deadline active.`
  };
}
