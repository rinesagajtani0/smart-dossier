import { askJson, askText } from "./ai.js";
import { parseJson } from "./json.js";
import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";

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
    `Extract property procedure fields from Albanian administrative documents based on ASHK requirements.
Legal context: ${ALBANIAN_LEGAL_BASIS.legalContext}
Relevant Albanian institutions: ${ALBANIAN_LEGAL_BASIS.institutions.map(i => i.name).join(", ")}
Extract this exact JSON shape:
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
Reference Albanian property laws: Law No. 111/2018, Law No. 33/2012, Law No. 9482/2006, Civil Code (1994).`,
    `Document:
${text.slice(0, 12000)}`,
    () => heuristicExtract(text)
  );
}

export async function summarizeDossier(dossier) {
  const documents = dossier.documents || [];
  const extracted = documents.map((doc) => parseJson(doc.extractedDataJson, {}));

  return askText(
    `Summarize Albanian property dossiers for civil servants working with ASHK and Albanian institutions.
Legal context: ${ALBANIAN_LEGAL_BASIS.legalContext}
Relevant Albanian institutions: ${ALBANIAN_LEGAL_BASIS.institutions.map(i => i.name).join(", ")}
Focus on the current phase, institution, risk level, and missing requirements according to Albanian property laws.
Reference Law No. 111/2018, Law No. 33/2012, Law No. 9482/2006, and Civil Code (1994) where relevant.
Provide 3 concise sentences.`,
    JSON.stringify({ dossier, extracted, albanianContext: ALBANIAN_LEGAL_BASIS }, null, 2),
    () => {
      const missing = parseJson(dossier.missingFieldsJson, []);
      const missingText = missing.length ? ` Missing items: ${missing.join(", ")}.` : " Required data looks mostly complete.";
      return `${dossier.title} is currently in ${dossier.phase} at ${dossier.institution}. Risk is ${dossier.riskLevel}.${missingText}`;
    }
  );
}
