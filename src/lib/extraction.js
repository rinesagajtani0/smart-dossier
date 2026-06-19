import { askJson, askText } from "./ai.js";
import { parseJson } from "./json.js";

const REQUIRED_FIELDS = [
  "applicantName",
  "ownerName",
  "propertyNumber",
  "cadastralZone",
  "propertyLocation",
  "documentType"
];

function match(text, patterns) {
  for (const pattern of patterns) {
    const result = text.match(pattern);
    if (result?.[1]) return result[1].trim();
  }
  return "";
}

export function heuristicExtract(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const data = {
    applicantName: match(normalized, [/applicant(?: name)?:\s*([^,.;]+)/i, /aplikuesi:\s*([^,.;]+)/i]),
    ownerName: match(normalized, [/owner(?: name)?:\s*([^,.;]+)/i, /pronari:\s*([^,.;]+)/i]),
    propertyNumber: match(normalized, [/property(?: number| no\.?)?:\s*([A-Z0-9/-]+)/i, /parcel(?:a| number)?:\s*([A-Z0-9/-]+)/i]),
    cadastralZone: match(normalized, [/cadastral zone:\s*([^,.;]+)/i, /zona kadastrale:\s*([^,.;]+)/i]),
    propertyLocation: match(normalized, [/location:\s*([^,.;]+)/i, /lokacioni:\s*([^,.;]+)/i]),
    documentType: match(normalized, [/document type:\s*([^,.;]+)/i, /lloji i dokumentit:\s*([^,.;]+)/i]),
    issuingInstitution: match(normalized, [/institution:\s*([^,.;]+)/i, /institucioni:\s*([^,.;]+)/i]),
    documentDate: match(normalized, [/date:\s*([0-9./-]+)/i, /data:\s*([0-9./-]+)/i])
  };

  const missingFields = REQUIRED_FIELDS.filter((field) => !data[field]);

  return {
    ...data,
    missingFields,
    confidence: Math.max(0.35, 1 - missingFields.length / REQUIRED_FIELDS.length)
  };
}

export async function extractDocumentFields(text) {
  return askJson(
    "Extract property procedure fields from administrative documents. Return only JSON.",
    `Extract this exact JSON shape:
{
  "applicantName": "",
  "ownerName": "",
  "propertyNumber": "",
  "cadastralZone": "",
  "propertyLocation": "",
  "documentType": "",
  "issuingInstitution": "",
  "documentDate": "",
  "missingFields": [],
  "confidence": 0.0
}

Document:
${text.slice(0, 12000)}`,
    () => heuristicExtract(text)
  );
}

export async function summarizeDossier(dossier) {
  const documents = dossier.documents || [];
  const extracted = documents.map((doc) => parseJson(doc.extractedDataJson, {}));

  return askText(
    "Summarize property dossiers for government clerks in 3 concise sentences.",
    JSON.stringify({ dossier, extracted }, null, 2),
    () => {
      const missing = parseJson(dossier.missingFieldsJson, []);
      const missingText = missing.length ? ` Missing items: ${missing.join(", ")}.` : " Required data looks mostly complete.";
      return `${dossier.title} is currently in ${dossier.phase} at ${dossier.institution}. Risk is ${dossier.riskLevel}.${missingText}`;
    }
  );
}
