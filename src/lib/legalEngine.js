import { askJson, askText } from "./ai.js";
import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";

const LEGAL_RULES = [
  {
    id: "law-111-2018-cadastral",
    label: "Compliance with Law No. 111/2018 On Cadastre",
    trigger: ["cadastral", "kadastral", "registration", "regjistrim"],
    requiredFields: ["propertyNumber", "cadastralZone", "ownerName", "boundaryCoordinates"],
    reason: "Law No. 111/2018 requires complete cadastral information for ASHK registration procedures."
  },
  {
    id: "law-33-2012-registration",
    label: "Compliance with Law No. 33/2012 On Registration of Immovable Property",
    trigger: ["registration", "regjistrim", "property", "pronë"],
    requiredFields: ["titleDocument", "ownershipProof", "identityDocument", "registrationFee"],
    reason: "Law No. 33/2012 mandates specific documentation for property registration with ASHK."
  },
  {
    id: "law-9482-2006-legalization",
    label: "Compliance with Law No. 9482/2006 On Legalization of Illegal Constructions",
    trigger: ["legalization", "legalizim", "illegal", "informal"],
    requiredFields: ["selfDeclaration", "constructionDate", "proofOfPossession", "technicalSurvey"],
    reason: "Law No. 9482/2006 requires self-declaration and technical verification for legalization processes."
  },
  {
    id: "civil-code-ownership",
    label: "Civil Code Compliance for Property Rights",
    trigger: ["ownership", "pronësi", "transfer", "transferim"],
    requiredFields: ["ownerName", "propertyTitle", "acquisitionMode", "legalBasis"],
    reason: "Albanian Civil Code (1994) establishes property rights and transfer requirements."
  },
  {
    id: "ashk-documentation",
    label: "ASHK Documentation Requirements",
    trigger: ["ashk", "cadastral", "certificate"],
    requiredFields: ["propertyNumber", "cadastralZone", "officialStamp", "registrationDate"],
    reason: "ASHK requires standardized documentation with official stamps and registration dates."
  }
];

function includesAny(text, words) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function missingFieldLabels(text, fields) {
  const normalized = text.toLowerCase();
  return fields.filter((field) => !normalized.includes(field.toLowerCase()));
}

export async function checkLegalDocument({ documentText = "", documentType = "unknown" }) {
  const matchedRules = LEGAL_RULES.filter((rule) => includesAny(`${documentType} ${documentText}`, rule.trigger));
  const changedFields = matchedRules.flatMap((rule) => missingFieldLabels(documentText, rule.requiredFields));
  const uniqueChangedFields = [...new Set(changedFields)];

  return askJson(
    `Check whether a property procedure document complies with Albanian property laws and ASHK requirements.
Legal context: ${ALBANIAN_LEGAL_BASIS.legalContext}
Relevant Albanian institutions: ${ALBANIAN_LEGAL_BASIS.institutions.map(i => i.name).join(", ")}
Return only JSON with this exact shape:
{
  "isOutdated": true,
  "changedFields": [],
  "reason": "",
  "newRequirements": [],
  "matchedRules": [{ "id": "", "label": "" }]
}
Reference actual Albanian laws: Law No. 111/2018 (On Cadastre), Law No. 33/2012 (On Registration of Immovable Property), Law No. 9482/2006 (On Legalization), and Civil Code (1994).`,
    JSON.stringify({ documentType, documentText: documentText.slice(0, 12000), rules: LEGAL_RULES, albanianContext: ALBANIAN_LEGAL_BASIS }, null, 2),
    () => ({
      isOutdated: uniqueChangedFields.length > 0,
      changedFields: uniqueChangedFields,
      reason: matchedRules.map((rule) => rule.reason).join(" ") || "Document complies with Albanian property legal requirements.",
      newRequirements: matchedRules.flatMap((rule) => rule.requiredFields),
      matchedRules: matchedRules.map((rule) => ({ id: rule.id, label: rule.label })),
      legalBasis: ALBANIAN_LEGAL_BASIS.laws.map(law => `${law.name}: ${law.title}`)
    })
  );
}

export async function rewriteLegalDocument({ documentText = "", documentType = "unknown" }) {
  const check = await checkLegalDocument({ documentText, documentType });

  const rewritePreview = await askText(
    `Rewrite administrative property procedure documents to comply with Albanian property laws and ASHK requirements.
Legal context: ${ALBANIAN_LEGAL_BASIS.legalContext}
Reference actual Albanian laws: Law No. 111/2018 (On Cadastre), Law No. 33/2012 (On Registration of Immovable Property), Law No. 9482/2006 (On Legalization), and Civil Code (1994).
Ensure the document meets ASHK documentation standards and includes required Albanian legal elements. Keep it concise.`,
    JSON.stringify({ documentType, documentText: documentText.slice(0, 12000), check, albanianContext: ALBANIAN_LEGAL_BASIS }, null, 2),
    () => [
      `Updated ${documentType} template - Albanian Legal Compliance`,
      "",
      documentText || "Document content was not provided.",
      "",
      "Required updates for Albanian legal compliance:",
      ...(check.newRequirements?.length ? check.newRequirements : ["Document meets Albanian legal requirements."]).map(
        (item) => `- Include ${item} per Albanian property laws.`
      ),
      "",
      "Legal basis: Law No. 111/2018, Law No. 33/2012, Law No. 9482/2006, Civil Code (1994)"
    ].join("\n")
  );

  return {
    ...check,
    rewritePreview
  };
}
