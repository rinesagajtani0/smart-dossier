# API për frontend (Smart Dossier)

Baza: `http://localhost:4000` (ose `PORT` nga `.env`)

---

## Flow i produktit → endpoint

| Hapi | Endpoint | Metoda |
|------|----------|--------|
| Qytetari fillon | `/procedures/generate` | POST |
| Intelligence për dosje | `/demo/dossiers/:id/intelligence` | GET |
| Kontroll legal | `/legal/check-document` | POST |
| Rishkrim legal | `/legal/rewrite-document` | POST |
| Vlera e pronës | `/properties/:propertyNumber/value-evolution` | GET |
| Lista dosjeve | `/dossiers` | GET |
| Upload dokument | `/dossiers/:id/documents` | POST (multipart) |
| NLP extract | `/nlp/extract/:documentId` | POST |

---

## 1. Procedure Generator

```http
POST /procedures/generate
Content-Type: application/json

{
  "intent": "I want to register inherited property",
  "municipality": "Prishtina",
  "propertyType": "apartment"
}
```

**Response:** `procedure`, `steps[]`, `requiredDocuments[]`, `expectedTimeline`, `institutions[]`, `relevantRules[]`, `risks[]`

---

## 2. Demo Intelligence (orchestrator)

```http
GET /demo/dossiers/25/intelligence
```

**Response:**

```json
{
  "dossier": { },
  "summary": "string",
  "similarCases": [{ "similarity": { "score": 100, "reasons": [] } }],
  "delayPrediction": {
    "risk": "high",
    "predictedDelay": "7-12 days",
    "likelyBlockage": "Property Valuation",
    "recommendedAction": "..."
  },
  "processStep": { },
  "recommendedAction": { "type": "request-documents", "label": "...", "reason": "..." },
  "generatedLetterPreview": "string"
}
```

---

## 3. Legal Engine

```http
POST /legal/check-document
Content-Type: application/json

{
  "documentType": "valuation report",
  "documentText": "Applicant: Arta Gashi..."
}
```

```http
POST /legal/rewrite-document
```

**Response (check):** `isOutdated`, `changedFields[]`, `reason`, `newRequirements[]`

**Response (rewrite):** të njëjtat + `rewritePreview`

---

## 4. Property value

```http
GET /properties/P-102%2F44/value-evolution
```

**Response:** `oneYearAgo`, `today`, `projectedAfterInfrastructure`, `drivers[]`

---

## 5. Health / AI status

```http
GET /health
```

```json
{ "ok": true, "ai": { "enabled": true, "model": "gpt-4o-mini" } }
```

Pa `OPENAI_API_KEY`, API përdor fallback lokal — demo funksionon gjithsesi.

---

## Shembull fetch (React)

```javascript
const API = "http://localhost:4000";

export async function getIntelligence(dossierId) {
  const res = await fetch(`${API}/demo/dossiers/${dossierId}/intelligence`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateProcedure(body) {
  const res = await fetch(`${API}/procedures/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}
```

CORS është i aktivizuar — fronti në port tjetër (p.sh. Vite 5173) mund të thërrasë API-n direkt.
