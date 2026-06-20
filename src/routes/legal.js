import { Router } from "express";
import { z } from "zod";
import { checkLegalDocument, rewriteLegalDocument } from "../lib/legalEngine.js";

const router = Router();

const documentSchema = z.object({
  documentText: z.string().default(""),
  documentType: z.string().min(1)
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

export default router;
