import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";
import { parseJson } from "./json.js";
import { prisma } from "./prisma.js";

function includesAny(text, keywords) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function matchesAny(value, allowed) {
  if (!value) return false;
  return allowed.map((item) => item.toLowerCase()).includes(String(value).toLowerCase());
}

function scoreRule(rule, dossier, documents) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);
  const combinedText = documents.map((doc) => doc.extractedText || "").join("\n");
  let score = 0;
  const reasons = [];

  if (matchesAny(dossier.propertyType, rule.triggers.propertyTypes)) {
    score += 25;
    reasons.push(`property type: ${dossier.propertyType}`);
  }
  if (matchesAny(dossier.propertyLocation, rule.triggers.locations)) {
    score += 20;
    reasons.push(`location: ${dossier.propertyLocation}`);
  }

  const missingMatches = missingFields.filter((field) =>
    rule.triggers.missingFields.map((item) => item.toLowerCase()).includes(String(field).toLowerCase())
  );
  if (missingMatches.length) {
    score += 30;
    reasons.push(`missing: ${missingMatches.join(", ")}`);
  }

  if (includesAny(combinedText, rule.triggers.keywords)) {
    score += 35;
    reasons.push("document text contains risk keywords");
  }

  return { score: Math.min(score, 100), reasons };
}

export async function getPropertyAlerts(propertyNumber) {
  const dossier = await prisma.dossier.findFirst({
    where: { propertyNumber },
    include: { documents: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!dossier) {
    return {
      propertyNumber,
      alerts: [],
      shouldNotifyUser: false,
      message: "No dossier found for this property number."
    };
  }

  const watchlistAlerts = ALBANIAN_LEGAL_BASIS.propertyWatchlist
    .filter((item) => item.propertyNumber.toLowerCase() === propertyNumber.toLowerCase())
    .map((item) => ({
      id: `watchlist-${item.propertyNumber}`,
      type: item.type,
      severity: item.severity,
      title: item.title,
      message: item.message,
      recommendedAction: item.recommendedAction,
      score: item.severity === "critical" ? 100 : 85,
      reasons: ["property is on the synthetic municipal watchlist"]
    }));

  const ruleAlerts = ALBANIAN_LEGAL_BASIS.propertyAlertRules
    .map((rule) => {
      const match = scoreRule(rule, dossier, dossier.documents || []);
      return {
        id: rule.id,
        type: rule.type,
        severity: rule.severity,
        title: rule.title,
        message: rule.message,
        recommendedAction: rule.recommendedAction,
        score: match.score,
        reasons: match.reasons
      };
    })
    .filter((alert) => alert.score >= 40)
    .sort((a, b) => b.score - a.score);

  const alerts = [...watchlistAlerts, ...ruleAlerts].sort((a, b) => b.score - a.score);

  return {
    propertyNumber,
    dossierId: dossier.id,
    title: dossier.title,
    phase: dossier.phase,
    alerts,
    shouldNotifyUser: alerts.some((alert) => ["critical", "high"].includes(alert.severity)),
    userAlertMessage: alerts.length
      ? `Notify the user about ${alerts[0].title.toLowerCase()} before the dossier advances.`
      : null,
    message: alerts.length
      ? "Property alerts detected. Notify the responsible user before the dossier advances."
      : "No property alerts detected."
  };
}
