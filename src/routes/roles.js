import { Router } from "express";
import { presentCitizenDossier, presentStaffDossier, trackingCodeFor } from "../lib/dossierPresenter.js";
import { parseJson } from "../lib/json.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function dueThisWeek(deadline) {
  if (!deadline) return false;
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(now.getDate() + 7);
  const date = new Date(deadline);
  return date >= now && date <= weekFromNow;
}

function daysUntil(deadline) {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function buildNextAction(dossier, processStep) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);
  if (missingFields.length) {
    return {
      type: "request-documents",
      label: `Request ${missingFields.join(", ")}`,
      reason: "The dossier cannot advance while required fields are missing."
    };
  }

  if (processStep?.criticalPoint) {
    return {
      type: "review-critical-point",
      label: `Review ${dossier.phase} carefully`,
      reason: "This phase is marked as a critical delay point in the process."
    };
  }

  return {
    type: processStep?.nextPhase ? "advance-phase" : "complete",
    label: processStep?.nextPhase ? `Move to ${processStep.nextPhase}` : "Prepare final closure",
    reason: processStep?.nextPhase
      ? "No missing fields are currently recorded."
      : "The dossier is already in the final process step."
  };
}

async function getDossierByTrackingCode(trackingCode) {
  const dossiers = await prisma.dossier.findMany();
  return dossiers.find((dossier) => trackingCodeFor(dossier).toLowerCase() === trackingCode.toLowerCase());
}

router.get("/", (_req, res) => {
  res.json({
    roles: [
      {
        id: "staff",
        label: "Civil Servant",
        description: "Handles dossiers, uploads documents, reviews AI extraction, and follows next-step guidance.",
        entryPoint: "/roles/staff/dossiers"
      },
      {
        id: "manager",
        label: "Manager",
        description: "Monitors bottlenecks, high-risk dossiers, deadlines, and generated decision letters.",
        entryPoint: "/roles/manager/dashboard"
      },
      {
        id: "citizen",
        label: "Citizen",
        description: "Tracks a public dossier status without internal notes, documents, or risk details.",
        entryPoint: "/roles/citizen/track/:trackingCode"
      }
    ]
  });
});

router.get("/staff/dossiers", async (req, res) => {
  const phase = req.query.phase?.toString();
  const riskLevel = req.query.riskLevel?.toString();
  const where = {
    ...(phase ? { phase } : {}),
    ...(riskLevel ? { riskLevel } : {})
  };

  const dossiers = await prisma.dossier.findMany({
    where,
    orderBy: [{ riskLevel: "desc" }, { deadline: "asc" }, { updatedAt: "desc" }]
  });

  res.json({
    role: "staff",
    count: dossiers.length,
    dossiers: dossiers.map(presentStaffDossier)
  });
});

router.get("/staff/dossiers/:id/workbench", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.id) },
    include: { documents: true, aiOutputs: true, letters: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const processStep = await prisma.processStep.findFirst({
    where: { processType: dossier.processType, phase: dossier.phase }
  });

  res.json({
    role: "staff",
    dossier: presentStaffDossier(dossier),
    nextAction: buildNextAction(dossier, processStep),
    processStep: processStep
      ? {
          phase: processStep.phase,
          institution: processStep.institution,
          requiredDocuments: parseJson(processStep.requiredDocumentsJson, []),
          criticalPoint: processStep.criticalPoint,
          expectedDays: processStep.expectedDays,
          nextPhase: processStep.nextPhase
        }
      : null,
    aiTools: [
      `GET /nlp/summary/${dossier.id}`,
      `POST /dossiers/${dossier.id}/documents`,
      `GET /dossiers/${dossier.id}/predict-delay`,
      `POST /dossiers/${dossier.id}/generate-letter`
    ]
  });
});

router.get("/manager/dashboard", async (_req, res) => {
  const dossiers = await prisma.dossier.findMany({
    include: { caseHistory: true }
  });

  const phaseCounts = dossiers.reduce((acc, dossier) => {
    acc[dossier.phase] = (acc[dossier.phase] || 0) + 1;
    return acc;
  }, {});

  const bottlenecks = Object.entries(phaseCounts)
    .map(([phase, count]) => ({ phase, count }))
    .sort((a, b) => b.count - a.count);

  const highRiskDossiers = dossiers
    .filter((dossier) => dossier.riskLevel === "high")
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 8)
    .map((dossier) => ({
      ...presentStaffDossier(dossier),
      daysUntilDeadline: daysUntil(dossier.deadline)
    }));

  res.json({
    role: "manager",
    totals: {
      dossiers: dossiers.length,
      highRisk: dossiers.filter((dossier) => dossier.riskLevel === "high").length,
      delayed: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "delayed").length,
      rejected: dossiers.filter((dossier) => dossier.caseHistory?.outcome === "rejected").length,
      deadlinesThisWeek: dossiers.filter((dossier) => dueThisWeek(dossier.deadline)).length
    },
    bottlenecks,
    highRiskDossiers,
    recommendedFocus: highRiskDossiers.at(0) || null
  });
});

router.get("/citizen/track/:trackingCode", async (req, res) => {
  const dossier = await getDossierByTrackingCode(req.params.trackingCode);
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const processStep = await prisma.processStep.findFirst({
    where: { processType: dossier.processType, phase: dossier.phase }
  });

  res.json({
    role: "citizen",
    dossier: presentCitizenDossier(dossier, processStep)
  });
});

export default router;
