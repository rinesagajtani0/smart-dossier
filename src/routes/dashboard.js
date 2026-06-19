import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseJson } from "../lib/json.js";

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
    acc[dossier.phase] = (acc[dossier.phase] || 0) + 1;
    return acc;
  }, {});

  const mainBottleneck = Object.entries(phaseCounts)
    .sort((a, b) => b[1] - a[1])
    .at(0)?.[0] || null;

  res.json({
    totalDossiers: dossiers.length,
    highRisk: dossiers.filter((dossier) => dossier.riskLevel === "high").length,
    delayed: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "delayed").length,
    rejected: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "rejected").length,
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
    if (!acc[dossier.phase]) acc[dossier.phase] = [];
    acc[dossier.phase].push({
      id: dossier.id,
      title: dossier.title,
      applicantName: dossier.applicantName,
      propertyLocation: dossier.propertyLocation,
      propertyType: dossier.propertyType,
      status: dossier.status,
      riskLevel: dossier.riskLevel,
      deadline: dossier.deadline,
      missingFields: parseJson(dossier.missingFieldsJson, [])
    });
    return acc;
  }, {});

  res.json({ columns });
});

export default router;
