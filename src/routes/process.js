import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { parseJson } from "../lib/json.js";

const router = Router();

router.get("/:processType", async (req, res) => {
  const steps = await prisma.processStep.findMany({
    where: { processType: req.params.processType },
    orderBy: { id: "asc" }
  });

  res.json(steps.map((step) => ({
    ...step,
    requiredDocuments: parseJson(step.requiredDocumentsJson, [])
  })));
});

export default router;
