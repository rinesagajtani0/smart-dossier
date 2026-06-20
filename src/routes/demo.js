import { Router } from "express";
import { buildRecommendedAction } from "../lib/actions.js";
import { getSimilarDossiers } from "../lib/caseMemory.js";
import { presentDossier, presentSimilarCase } from "../lib/dossierPresenter.js";
import { summarizeDossier } from "../lib/extraction.js";
import { parseJson } from "../lib/json.js";
import { buildPreventDelayLetter } from "../lib/letters.js";
import { predictDelay } from "../lib/prediction.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function presentProcessStep(step) {
  if (!step) return null;

  return {
    ...step,
    requiredDocuments: parseJson(step.requiredDocumentsJson, [])
  };
}

router.get("/dossiers/:id/intelligence", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.id) },
    include: { documents: true, caseHistory: true, letters: true, aiOutputs: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const [summary, similarCases, processSteps, processStep] = await Promise.all([
    summarizeDossier(dossier),
    getSimilarDossiers(dossier.id, 5),
    prisma.processStep.findMany({ where: { processType: dossier.processType } }),
    prisma.processStep.findFirst({
      where: { processType: dossier.processType, phase: dossier.phase }
    })
  ]);

  const delayPrediction = predictDelay(dossier, similarCases || [], processSteps);

  res.json({
    dossier: presentDossier(dossier),
    summary,
    similarCases: (similarCases || []).map(presentSimilarCase),
    delayPrediction,
    processStep: presentProcessStep(processStep),
    recommendedAction: buildRecommendedAction(dossier, processStep),
    generatedLetterPreview: buildPreventDelayLetter(dossier)
  });
});

export default router;
