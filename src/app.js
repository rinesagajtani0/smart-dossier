import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dashboardRouter from "./routes/dashboard.js";
import dossiersRouter from "./routes/dossiers.js";
import nlpRouter from "./routes/nlp.js";
import processRouter from "./routes/process.js";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "Smart Dossier AI API" });
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
      "GET /process/:processType"
    ]
  });
});

app.use("/dashboard", dashboardRouter);
app.use("/dossiers", dossiersRouter);
app.use("/nlp", nlpRouter);
app.use("/process", processRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || "Internal server error"
  });
});
