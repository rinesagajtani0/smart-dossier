import { Router } from "express";
import { legalImpactGraphService } from "../lib/legalImpactGraphService.js";
import { normalizePhaseForUi } from "../lib/phaseMap.js";
import { prisma } from "../lib/prisma.js";
import { trackingCodeFor } from "../lib/dossierPresenter.js";

const router = Router();

// Lets the dashboard build a "legal change" selector instead of asking for
// a dossier ID — selection is the entry point, not a dossier lookup.
router.get("/legal-changes", (_req, res) => {
  res.json(legalImpactGraphService.getAllLegalChanges());
});

router.get("/legal-impact/:legalChangeId", async (req, res) => {
  const legalChange = legalImpactGraphService.getLegalChangeById(req.params.legalChangeId);
  if (!legalChange) return res.status(404).json({ error: "Legal change not found" });

  const impact = legalImpactGraphService.evaluateLegalChanges([legalChange]);

  let dossiersRequiringReview = [];
  if (impact.legalChangeApplies) {
    const candidateDossiers = await prisma.dossier.findMany({
      where: { processType: { in: legalChange.affectedProcessTypes }, status: "open" }
    });
    dossiersRequiringReview = legalImpactGraphService.filterDossiersRequiringReview(
      candidateDossiers,
      impact.affectedNodes
    );
  }

  res.json({
    legalChangeId: legalChange.id,
    legalChangeTitle: legalChange.title,
    legalChangeApplies: impact.legalChangeApplies,
    affectedNodes: impact.affectedNodes,
    // Serialized as "from -> to" strings at the HTTP boundary to match the
    // existing frontend contract, even though the service works with
    // GraphEdge {from, to} objects internally.
    affectedTransitions: impact.affectedTransitions.map(({ from, to }) => `${from} -> ${to}`),
    affectedDossiers: dossiersRequiringReview.length,
    dossiersRequiringReview: dossiersRequiringReview.map((dossier) => ({
      id: dossier.id,
      trackingCode: trackingCodeFor(dossier),
      processType: dossier.processType,
      phase: normalizePhaseForUi(dossier.phase)
    })),
    impactScore: impact.impactScore,
    severity: impact.severity,
    changedFields: impact.changedFields,
    addedRequiredDocuments: impact.addedRequiredDocuments,
    recommendedAction: impact.recommendedAction
  });
});

export default router;
