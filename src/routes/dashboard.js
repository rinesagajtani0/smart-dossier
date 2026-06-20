import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseJson } from "../lib/json.js";
import { evaluateLegalChangeImpact } from "../lib/legalEngine.js";
import { normalizePhaseForUi } from "../lib/phaseMap.js";

const router = Router();

function dueThisWeek(deadline) {
  if (!deadline) return false;
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);
  const date = new Date(deadline);
  return date >= now && date <= weekFromNow;
}

router.get("/stats", async (_req, res) => {
  const dossiers = await prisma.dossier.findMany({
    include: { caseHistory: true }
  });

  const phaseCounts = dossiers.reduce((acc, dossier) => {
    const phase = normalizePhaseForUi(dossier.phase);
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});
  const legalImpacted = dossiers.filter((dossier) => evaluateLegalChangeImpact(dossier).hasImpact);

  const mainBottleneck = Object.entries(phaseCounts)
    .sort((a, b) => b[1] - a[1])
    .at(0)?.[0] || null;

  res.json({
    totalDossiers: dossiers.length,
    highRisk: dossiers.filter((dossier) => dossier.riskLevel === "high").length,
    delayed: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "delayed").length,
    rejected: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "rejected").length,
    legalImpacted: legalImpacted.length,
    deadlinesThisWeek: dossiers.filter((dossier) => dueThisWeek(dossier.deadline)).length,
    mainBottleneck,
    byPhase: phaseCounts,
    byRisk: {
      low: dossiers.filter((dossier) => dossier.riskLevel === "low").length,
      medium: dossiers.filter((dossier) => dossier.riskLevel === "medium").length,
      high: dossiers.filter((dossier) => dossier.riskLevel === "high").length
    }
  });
});

router.get("/kanban", async (_req, res) => {
  const dossiers = await prisma.dossier.findMany({
    orderBy: [{ phase: "asc" }, { deadline: "asc" }]
  });

  const columns = dossiers.reduce((acc, dossier) => {
    const phase = normalizePhaseForUi(dossier.phase);
    const legalChangeImpact = evaluateLegalChangeImpact(dossier);
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push({
      id: dossier.id,
      title: dossier.title,
      applicantName: dossier.applicantName,
      propertyLocation: dossier.propertyLocation,
      propertyType: dossier.propertyType,
      phase,
      status: dossier.status,
      riskLevel: dossier.riskLevel,
      legalChangeImpact: legalChangeImpact.hasImpact
        ? {
            hasImpact: true,
            additionalRequiredDocuments: legalChangeImpact.additionalRequiredDocuments,
            recommendedAction: legalChangeImpact.recommendedAction
          }
        : null,
      deadline: dossier.deadline,
      missingFields: parseJson(dossier.missingFieldsJson, [])
    });
    return acc;
  }, {});

  res.json({ columns });
});

export default router;
