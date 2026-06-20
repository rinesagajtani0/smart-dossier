import { Router } from "express";
import { applyLegalUpdatesToProcessStep } from "../lib/legalEngine.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/:processType", async (req, res) => {
  const steps = await prisma.processStep.findMany({
    where: { processType: req.params.processType },
    orderBy: { id: "asc" }
  });

  res.json(steps.map((step) => applyLegalUpdatesToProcessStep(req.params.processType, step)));
});

export default router;
