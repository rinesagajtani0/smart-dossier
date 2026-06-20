import { Router } from "express";
import { ALBANIAN_LEGAL_BASIS } from "../lib/albanianLegalBasis.js";
import { getPropertyAlerts } from "../lib/propertyAlerts.js";
import { getPropertyValueEvolution } from "../lib/propertyValue.js";

const router = Router();

router.get("/watchlist/rules", (_req, res) => {
  res.json({
    propertyWatchlist: ALBANIAN_LEGAL_BASIS.propertyWatchlist,
    propertyAlertRules: ALBANIAN_LEGAL_BASIS.propertyAlertRules
  });
});

router.get("/:propertyNumber/value-evolution", async (req, res) => {
  const propertyNumber = decodeURIComponent(req.params.propertyNumber).trim();
  if (!propertyNumber) {
    return res.status(400).json({ error: "propertyNumber is required" });
  }

  const evolution = await getPropertyValueEvolution(propertyNumber);
  res.json(evolution);
});

router.get("/:propertyNumber/alerts", async (req, res) => {
  const propertyNumber = decodeURIComponent(req.params.propertyNumber).trim();
  if (!propertyNumber) {
    return res.status(400).json({ error: "propertyNumber is required" });
  }

  const alerts = await getPropertyAlerts(propertyNumber);
  res.json(alerts);
});

export default router;
