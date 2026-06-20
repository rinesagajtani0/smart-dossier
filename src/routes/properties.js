import { Router } from "express";
import { getPropertyValueEvolution } from "../lib/propertyValue.js";

const router = Router();

router.get("/:propertyNumber/value-evolution", async (req, res) => {
  const propertyNumber = decodeURIComponent(req.params.propertyNumber).trim();
  if (!propertyNumber) {
    return res.status(400).json({ error: "propertyNumber is required" });
  }

  const evolution = await getPropertyValueEvolution(propertyNumber);
  res.json(evolution);
});

export default router;
