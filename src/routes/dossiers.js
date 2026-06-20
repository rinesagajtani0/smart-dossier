import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import { z } from "zod";
import { getSimilarDossiers } from "../lib/caseMemory.js";
import { presentDossier } from "../lib/dossierPresenter.js";
import { extractDocumentFields, summarizeDossier } from "../lib/extraction.js";
import { parseJson, toJson } from "../lib/json.js";
import { buildPreventDelayLetter } from "../lib/letters.js";
import { adaptDossierToLegalChanges, buildLegalChangeUserAlert, evaluateLegalChangeImpact } from "../lib/legalEngine.js";
import { predictDelay } from "../lib/prediction.js";
import { getPropertyAlerts } from "../lib/propertyAlerts.js";
import { prisma } from "../lib/prisma.js";

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

async function readUploadedText(file) {
  const buffer = fs.readFileSync(file.path);
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdf(buffer);
    return parsed.text;
  }
  return buffer.toString("utf8");
}

function removeUploadedFile(file) {
  if (!file?.path) return;
  fs.unlink(file.path, (error) => {
    if (error) console.warn(`Could not remove uploaded file ${file.path}:`, error.message);
  });
}

async function getDossierAlerts(dossier) {
  const legalChangeImpact = evaluateLegalChangeImpact(dossier);
  const propertyAlerts = dossier.propertyNumber
    ? await getPropertyAlerts(dossier.propertyNumber)
    : { alerts: [], message: "No property number available for alert checks." };
  const legalAlert = buildLegalChangeUserAlert(legalChangeImpact);

  return {
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
  };
}

async function autoAdaptDossier(dossierId) {
  const adaptation = await adaptDossierToLegalChanges(dossierId);
  if (!adaptation) return null;

  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(dossierId) },
    include: { documents: true, caseHistory: true, letters: true, aiOutputs: true }
  });
  if (!dossier) return null;

  return {
    dossier,
    legalAdaptation: {
      adapted: adaptation.adapted,
      requestedDocuments: adaptation.requestedDocuments,
      missingFields: adaptation.missingFields,
      userAlert: adaptation.userAlert
    },
    alerts: await getDossierAlerts(dossier)
  };
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
  res.json({
    ...presentDossier(dossier),
    alerts: await getDossierAlerts(dossier)
  });
});

router.post("/", async (req, res) => {
  const input = dossierSchema.parse(req.body);
  const { missingFields, ...rest } = input;
  const dossier = await prisma.dossier.create({
    data: {
      ...rest,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      missingFieldsJson: toJson(missingFields)
    }
  });
  const adapted = await autoAdaptDossier(dossier.id);
  res.status(201).json({
    ...presentDossier(adapted?.dossier || dossier),
    legalAdaptation: adapted?.legalAdaptation || null,
    alerts: adapted?.alerts || null
  });
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
  const adapted = await autoAdaptDossier(dossier.id);
  res.json({
    ...presentDossier(adapted?.dossier || dossier),
    legalAdaptation: adapted?.legalAdaptation || null,
    alerts: adapted?.alerts || null
  });
});

router.post("/:id/documents", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Upload a file using multipart field name 'file'." });

  const dossierId = Number(req.params.id);
  if (!Number.isInteger(dossierId)) {
    removeUploadedFile(req.file);
    return res.status(400).json({ error: "Dossier id must be a number." });
  }

  const existingDossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!existingDossier) {
    removeUploadedFile(req.file);
    return res.status(404).json({ error: "Dossier not found" });
  }

  const text = await readUploadedText(req.file);
  const extracted = await extractDocumentFields(text);
  const document = await prisma.document.create({
    data: {
      dossierId,
      fileName: req.file.originalname,
      documentType: extracted.documentType || "unknown",
      extractedText: text,
      extractedDataJson: toJson(extracted)
    }
  });

  const missingFields = extracted.missingFields || [];
  const dossier = await prisma.dossier.update({
    where: { id: dossierId },
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
  const adapted = await autoAdaptDossier(dossier.id);

  res.status(201).json({
    ...document,
    extractedData: extracted,
    legalAdaptation: adapted?.legalAdaptation || null,
    alerts: adapted?.alerts || null
  });
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

  const content = buildPreventDelayLetter(dossier);

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
