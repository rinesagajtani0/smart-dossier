import { Router } from "express";
import { extractDocumentFields, summarizeDossier } from "../lib/extraction.js";
import { parseJson, toJson } from "../lib/json.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/extract/:documentId", async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: Number(req.params.documentId) } });
  if (!document) return res.status(404).json({ error: "Document not found" });

  const extracted = await extractDocumentFields(document.extractedText);
  const updated = await prisma.document.update({
    where: { id: document.id },
    data: {
      documentType: extracted.documentType || document.documentType,
      extractedDataJson: toJson(extracted)
    }
  });

  res.json({ ...updated, extractedData: extracted });
});

router.get("/summary/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) },
    include: { documents: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const summary = await summarizeDossier(dossier);
  await prisma.aiOutput.create({
    data: { dossierId: dossier.id, type: "summary", content: summary }
  });
  res.json({ summary });
});

router.post("/ask/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) },
    include: { documents: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const question = req.body.question || "What is the next best action?";
  const summary = await summarizeDossier(dossier);
  const firstMissing = parseJson(dossier.missingFieldsJson, [])[0];

  res.json({
    question,
    answer: `${summary} Recommended next action: ${firstMissing ? `request ${firstMissing}` : "continue to the next process step"}.`
  });
});

export default router;
