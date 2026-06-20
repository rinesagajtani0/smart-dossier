import { Router } from "express";
import { legalImpactGraphService } from "../lib/legalImpactGraphService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/legal-impact/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const applicableChanges = legalImpactGraphService.getApplicableLegalChanges(dossier);
  const impact = legalImpactGraphService.evaluateLegalChanges(applicableChanges);

  let affectedDossiers = 0;
  if (impact.legalChangeApplies) {
    const openDossiers = await prisma.dossier.findMany({
      where: { processType: dossier.processType, status: "open" },
      select: { phase: true }
    });
    affectedDossiers = legalImpactGraphService.countAffectedDossiers(
      openDossiers.map((openDossier) => openDossier.phase),
      impact.affectedNodes
    );
  }

  res.json({
    dossierId: dossier.id,
    legalChangeApplies: impact.legalChangeApplies,
    affectedNodes: impact.affectedNodes,
    affectedTransitions: impact.affectedTransitions,
    affectedDossiers,
    impactScore: impact.impactScore,
    severity: impact.severity,
    recommendedAction: impact.recommendedAction
  });
});

export default router;
