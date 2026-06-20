# Smart Dossier AI

Backend API for a property dossier platform with document extraction, case memory, delay prediction, and prevent-delay letter generation.

## Stack

- Node.js + Express
- Prisma + SQLite
- Optional OpenAI integration
- PDF/text upload extraction

## Setup

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Main endpoints

- `GET /health`
- `GET /`
- `GET /dashboard/stats`
- `GET /dashboard/kanban`
- `GET /dossiers`
- `GET /dossiers/:id`
- `POST /dossiers`
- `PATCH /dossiers/:id`
- `POST /dossiers/:id/documents` multipart upload with field `file`
- `POST /nlp/extract/:documentId`
- `GET /nlp/summary/:dossierId`
- `POST /nlp/ask/:dossierId`
- `GET /dossiers/:id/similar`
- `GET /dossiers/:id/predict-delay`
- `POST /dossiers/:id/generate-letter`
- `GET /process/:processType`
- `GET /roles`
- `GET /roles/staff/dossiers`
- `GET /roles/staff/dossiers/:id/workbench`
- `GET /roles/manager/dashboard`
- `GET /roles/citizen/track/:trackingCode`

## Demo roles

The platform uses demo role views without authentication, matching the hackathon constraint.

- Civil servant: `GET /roles/staff/dossiers`
- Manager: `GET /roles/manager/dashboard`
- Citizen tracking: `GET /roles/citizen/track/EXP-001`

## Demo flow

1. Open `GET /dossiers` and pick a high-risk dossier.
2. Call `GET /dossiers/:id/similar` to show the case memory engine.
3. Call `GET /dossiers/:id/predict-delay` to show predicted blockage and delay.
4. Call `POST /dossiers/:id/generate-letter` to generate the prevent-delay letter.

If `OPENAI_API_KEY` is empty, the API uses deterministic local heuristics so the demo still works.
