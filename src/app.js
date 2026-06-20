import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { hasOpenAI, openAiModel } from "./lib/ai.js";
import dashboardRouter from "./routes/dashboard.js";
import demoRouter from "./routes/demo.js";
import dossiersRouter from "./routes/dossiers.js";
import legalRouter from "./routes/legal.js";
import nlpRouter from "./routes/nlp.js";
import proceduresRouter from "./routes/procedures.js";
import processRouter from "./routes/process.js";
import propertiesRouter from "./routes/properties.js";
import rolesRouter from "./routes/roles.js";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    name: "Smart Dossier AI API",
    ai: { enabled: hasOpenAI, model: hasOpenAI ? openAiModel : null }
  });
});

app.get("/", (_req, res) => {
  res.json({
    name: "Smart Dossier AI API",
    status: "running",
    endpoints: [
      "GET /health",
      "GET /dashboard/stats",
      "GET /dashboard/kanban",
      "GET /dossiers",
      "GET /dossiers/:id",
      "GET /dossiers/:id/similar",
      "GET /dossiers/:id/predict-delay",
      "POST /dossiers/:id/documents",
      "POST /dossiers/:id/generate-letter",
      "GET /nlp/summary/:dossierId",
      "POST /nlp/ask/:dossierId",
      "GET /process/:processType",
      "GET /roles",
      "GET /roles/staff/dossiers",
      "GET /roles/staff/dossiers/:id/workbench",
      "GET /roles/manager/dashboard",
      "GET /roles/citizen/track/:trackingCode",
      "GET /demo/dossiers/:id/intelligence",
      "POST /procedures/generate",
      "POST /legal/check-document",
      "POST /legal/rewrite-document",
      "GET /properties/:propertyNumber/value-evolution"
    ]
  });
});

app.use("/demo", demoRouter);
app.use("/dashboard", dashboardRouter);
app.use("/dossiers", dossiersRouter);
app.use("/legal", legalRouter);
app.use("/nlp", nlpRouter);
app.use("/procedures", proceduresRouter);
app.use("/process", processRouter);
app.use("/properties", propertiesRouter);
app.use("/roles", rolesRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || "Internal server error"
  });
});
