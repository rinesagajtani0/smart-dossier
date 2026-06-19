import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { z } from "zod";
import { extractDocumentFields, summarizeDossier } from "../lib/extraction.js";
import { parseJson, toJson } from "../lib/json.js";
import { predictDelay } from "../lib/prediction.js";
import { prisma } from "../lib/prisma.js";
import { scoreSimilarity } from "../lib/similarity.js";

const router = Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const dossierSchema = z.object({
  title: z.string().min(2),
  processType: z.string().default("property-registration"),
  applicantName: z.string().optional(),
  ownerName: z.string().optional(),
  propertyLocation: z.string().optional(),
  propertyNumber: z.string().optional(),
  cadastralZone: z.string().optional(),
  propertyType: z.string().optional(),
  phase: z.string().default("ASHK Check"),
  institution: z.string().default("ASHK"),
  status: z.string().default("open"),
  deadline: z.string().datetime().optional(),
  missingFields: z.array(z.string()).default([]),
  riskLevel: z.string().default("medium")
});

function presentDossier(dossier) {
  return {
    ...dossier,
    missingFields: parseJson(dossier.missingFieldsJson, []),
    documents: dossier.documents?.map((doc) => ({
      ...doc,
      extractedData: parseJson(doc.extractedDataJson, {})
    })),
    caseHistory: dossier.caseHistory
      ? {
          ...dossier.caseHistory,
          similarityTags: parseJson(dossier.caseHistory.similarityTagsJson, [])
        }
      : null
  };
}

async function readUploadedText(file) {
  const buffer = fs.readFileSync(file.path);
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdf(buffer);
    return parsed.text;
  }
  return buffer.toString("utf8");
}

async function getSimilarDossiers(id) {
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: { caseHistory: true }
  });
  if (!dossier) return null;

  const candidates = await prisma.dossier.findMany({
    where: { id: { not: id }, caseHistory: { isNot: null } },
    include: { caseHistory: true }
  });

  return candidates
    .map((candidate) => ({ ...candidate, similarity: scoreSimilarity(dossier, candidate) }))
    .filter((candidate) => candidate.similarity.score > 0)
    .sort((a, b) => b.similarity.score - a.similarity.score)
    .slice(0, 5);
}

router.get("/", async (_req, res) => {
  const dossiers = await prisma.dossier.findMany({
    orderBy: { updatedAt: "desc" },
    include: { documents: true, caseHistory: true }
  });
  res.json(dossiers.map(presentDossier));
});

router.get("/:id", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.id) },
    include: { documents: true, caseHistory: true, letters: true, aiOutputs: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });
  res.json(presentDossier(dossier));
});

router.post("/", async (req, res) => {
  const input = dossierSchema.parse(req.body);
  const dossier = await prisma.dossier.create({
    data: {
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      missingFieldsJson: toJson(input.missingFields)
    }
  });
  res.status(201).json(presentDossier(dossier));
});

router.patch("/:id", async (req, res) => {
  const updates = { ...req.body };
  if (updates.deadline) updates.deadline = new Date(updates.deadline);
  if (updates.missingFields) {
    updates.missingFieldsJson = toJson(updates.missingFields);
    delete updates.missingFields;
  }

  const dossier = await prisma.dossier.update({
    where: { id: Number(req.params.id) },
    data: updates
  });
  res.json(presentDossier(dossier));
});

router.post("/:id/documents", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Upload a file using multipart field name 'file'." });

  const text = await readUploadedText(req.file);
  const extracted = await extractDocumentFields(text);
  const document = await prisma.document.create({
    data: {
      dossierId: Number(req.params.id),
      fileName: req.file.originalname,
      documentType: extracted.documentType || "unknown",
      extractedText: text,
      extractedDataJson: toJson(extracted)
    }
  });

  const missingFields = extracted.missingFields || [];
  await prisma.dossier.update({
    where: { id: Number(req.params.id) },
    data: {
      applicantName: extracted.applicantName || undefined,
      ownerName: extracted.ownerName || undefined,
      propertyNumber: extracted.propertyNumber || undefined,
      cadastralZone: extracted.cadastralZone || undefined,
      propertyLocation: extracted.propertyLocation || undefined,
      missingFieldsJson: toJson(missingFields),
      riskLevel: missingFields.length >= 2 ? "high" : missingFields.length ? "medium" : "low"
    }
  });

  res.status(201).json({ ...document, extractedData: extracted });
});

router.post("/nlp/extract/:documentId", async (req, res) => {
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

router.get("/nlp/summary/:dossierId", async (req, res) => {
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

router.post("/nlp/ask/:dossierId", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.dossierId) },
    include: { documents: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const question = req.body.question || "What is the next best action?";
  const summary = await summarizeDossier(dossier);
  res.json({
    question,
    answer: `${summary} Recommended next action: ${parseJson(dossier.missingFieldsJson, [])[0] ? `request ${parseJson(dossier.missingFieldsJson, [])[0]}` : "continue to the next process step"}.`
  });
});

router.get("/:id/similar", async (req, res) => {
  const similar = await getSimilarDossiers(Number(req.params.id));
  if (!similar) return res.status(404).json({ error: "Dossier not found" });
  res.json(similar.map(presentDossier));
});

router.get("/:id/predict-delay", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(req.params.id) },
    include: { caseHistory: true }
  });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const similar = await getSimilarDossiers(dossier.id);
  const processSteps = await prisma.processStep.findMany({
    where: { processType: dossier.processType }
  });

  res.json(predictDelay(dossier, similar || [], processSteps));
});

router.post("/:id/generate-letter", async (req, res) => {
  const dossier = await prisma.dossier.findUnique({ where: { id: Number(req.params.id) } });
  if (!dossier) return res.status(404).json({ error: "Dossier not found" });

  const missing = parseJson(dossier.missingFieldsJson, []);
  const content = [
    `Subject: Request to complete dossier ${dossier.title}`,
    "",
    `Dear ${dossier.applicantName || "Applicant"},`,
    "",
    `During the review phase "${dossier.phase}" at ${dossier.institution}, the dossier requires the following item(s): ${missing.join(", ") || "additional supporting documentation"}.`,
    `Please submit the requested documentation as soon as possible to prevent delay in the property procedure.`,
    "",
    "Respectfully,",
    "Smart Dossier AI"
  ].join("\n");

  const letter = await prisma.letter.create({
    data: {
      dossierId: dossier.id,
      type: req.body.type || "prevent-delay",
      content
    }
  });

  res.status(201).json(letter);
});

export default router;
