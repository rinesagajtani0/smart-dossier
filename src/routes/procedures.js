import { Router } from "express";
import { z } from "zod";
import { generateProcedure } from "../lib/procedureGenerator.js";

const router = Router();

const generateSchema = z.object({
  intent: z.string().min(3),
  municipality: z.string().optional().default(""),
  propertyType: z.string().optional().default("")
});

router.post("/generate", async (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const procedure = await generateProcedure(parsed.data);
  res.json(procedure);
});

export default router;
