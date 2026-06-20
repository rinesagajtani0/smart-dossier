import { Router } from "express";
import { z } from "zod";
import { ALBANIAN_LEGAL_BASIS } from "../lib/albanianLegalBasis.js";
import {
  adaptDossierToLegalChanges,
  buildLegalChangeUserAlert,
  checkLegalDocument,
  evaluateLegalChangeImpact,
  rewriteLegalDocument
} from "../lib/legalEngine.js";
import { getPropertyAlerts } from "../lib/propertyAlerts.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

const documentSchema = z.object({
  documentText: z.string().default(""),
  documentType: z.string().min(1)
});

router.get("/updates", (_req, res) => {
  res.json({
    regulatoryUpdates: ALBANIAN_LEGAL_BASIS.regulatoryUpdates,
    sources: ALBANIAN_LEGAL_BASIS.sources
  });
});

router.post("/check-document", async (req, res) => {
  const parsed = documentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = await checkLegalDocument(parsed.data);
  res.json(result);
});

router.post("/rewrite-document", async (req, res) => {
  const parsed = documentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = await rewriteLegalDocument(parsed.data);
  res.json(result);
});

router.get("/change-impact/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  res.json(evaluateLegalChangeImpact(dossier));
});

router.post("/adapt-dossier/:dossierId", async (req, res) => {
  const result = await adaptDossierToLegalChanges(req.params.dossierId);
  if (!result) return res.status(404).json({ error: "Dossier not found" });

  res.json(result);
});

router.get("/dossier-alerts/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const legalChangeImpact = evaluateLegalChangeImpact(dossier);
  const propertyAlerts = dossier.propertyNumber
    ? await getPropertyAlerts(dossier.propertyNumber)
    : { alerts: [], message: "No property number available for alert checks." };

  const legalAlert = buildLegalChangeUserAlert(legalChangeImpact);

  res.json({
    dossierId: dossier.id,
    legalChangeImpact,
    propertyAlerts,
    userAlerts: [
      ...(legalAlert ? [legalAlert] : []),
      ...(propertyAlerts.alerts || []).map((alert) => ({
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        recommendedAction: alert.recommendedAction,
        score: alert.score,
        reasons: alert.reasons
      }))
    ]
  });
});

export default router;
