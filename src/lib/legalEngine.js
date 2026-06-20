import { askJson, askText } from "./ai.js";
import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";
import { parseJson, toJson } from "./json.js";
import { normalizePhaseForUi } from "./phaseMap.js";
import { prisma } from "./prisma.js";

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

function intersects(left, right) {
  const normalizedRight = new Set(right.map((item) => String(item).toLowerCase()));
  return left.filter((item) => normalizedRight.has(String(item).toLowerCase()));
}

function updateAppliesToDossier(update, dossier) {
  const processMatches = update.appliesToProcessTypes.includes(dossier.processType);
  const phase = normalizePhaseForUi(dossier.phase);
  const phaseMatches = update.appliesToPhases.includes(phase) || update.appliesToPhases.includes(dossier.phase);
  return processMatches && phaseMatches;
}

export function getApplicableLegalUpdates(processType, phase) {
  const normalizedPhase = normalizePhaseForUi(phase);
  return ALBANIAN_LEGAL_BASIS.regulatoryUpdates.filter((update) => {
    const processMatches = update.appliesToProcessTypes.includes(processType);
    const phaseMatches = update.appliesToPhases.includes(normalizedPhase) || update.appliesToPhases.includes(phase);
    return processMatches && phaseMatches;
  });
}

export function applyLegalUpdatesToProcessStep(processType, step) {
  if (!step) return null;

  const updates = getApplicableLegalUpdates(processType, step.phase);
  const requiredDocuments = parseJson(step.requiredDocumentsJson, step.requiredDocuments || []);
  const addedDocuments = [...new Set(updates.flatMap((update) => update.newRequiredDocuments))];

  return {
    ...step,
    requiredDocuments: [...new Set([...requiredDocuments, ...addedDocuments])],
    requiredDocumentsJson: undefined,
    criticalPoint: step.criticalPoint || updates.length > 0,
    expectedDays: step.expectedDays + updates.length * 2,
    legalChangeApplies: updates.length > 0,
    legalUpdates: updates.map((update) => ({
      id: update.id,
      title: update.title,
      effectiveDate: update.effectiveDate,
      reason: update.reason,
      source: update.source,
      newRequiredDocuments: update.newRequiredDocuments,
      changedFields: update.changedFields
    })),
    changedFields: [...new Set(updates.flatMap((update) => update.changedFields))],
    addedRequiredDocuments: addedDocuments
  };
}

export function buildSystemAdaptationPlan(dossier, impact) {
  if (!impact?.hasImpact) {
    return {
      requiresWorkflowChange: false,
      riskAdjustment: "none",
      deadlineAction: "keep-current-deadline",
      processAction: "continue-current-workflow",
      fieldActions: [],
      documentActions: [],
      operationalActions: []
    };
  }

  const requiresDocuments = impact.additionalRequiredDocuments.length > 0;
  const fieldActions = impact.changedFields.map((field) => ({
    field,
    action: "revalidate-field",
    reason: "The legal basis changed for this data point."
  }));
  const documentActions = impact.additionalRequiredDocuments.map((document) => ({
    document,
    action: "request-or-refresh-document",
    reason: "The updated legal requirement applies to the dossier's current process phase."
  }));

  return {
    requiresWorkflowChange: true,
    riskAdjustment: requiresDocuments || impact.changedFields.length >= 3 ? "increase" : "review",
    deadlineAction: "recalculate-or-confirm-deadline",
    processAction: requiresDocuments ? "hold-before-next-phase" : "legal-review-before-next-phase",
    fieldActions,
    documentActions,
    operationalActions: [
      {
        action: "notify-assigned-user",
        reason: "The user must be warned before the dossier advances."
      },
      {
        action: "refresh-current-process-step",
        reason: "Required documents, expected days, or critical-point status may have changed."
      },
      {
        action: "rerun-delay-prediction",
        reason: "Legal changes can increase delay risk even when no document is missing."
      }
    ],
    affectedPhase: impact.phase,
    affectedProcessType: dossier.processType
  };
}

export function buildLegalChangeUserAlert(impact) {
  if (!impact?.hasImpact) return null;

  return {
    type: "legal-change",
    severity: impact.additionalRequiredDocuments.length ? "high" : "medium",
    title: "Legal requirements changed",
    message: impact.additionalRequiredDocuments.length
      ? `New legal requirements apply. Request ${impact.additionalRequiredDocuments.join(", ")} from the user.`
      : impact.recommendedAction,
    recommendedAction: impact.recommendedAction,
    requestedDocuments: impact.additionalRequiredDocuments,
    changedFields: impact.changedFields,
    applicableUpdateIds: impact.applicableUpdates.map((update) => update.id)
  };
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

export function evaluateLegalChangeImpact(dossier) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);
  const applicableUpdates = ALBANIAN_LEGAL_BASIS.regulatoryUpdates.filter((update) =>
    updateAppliesToDossier(update, dossier)
  );

  const requiredDocuments = [
    ...new Set(applicableUpdates.flatMap((update) => update.newRequiredDocuments))
  ];
  const alreadyMissing = intersects(requiredDocuments, missingFields);
  const additionalRequiredDocuments = requiredDocuments.filter(
    (document) => !alreadyMissing.includes(document)
  );

  return {
    hasImpact: applicableUpdates.length > 0,
    dossierId: dossier.id,
    processType: dossier.processType,
    phase: normalizePhaseForUi(dossier.phase),
    applicableUpdates: applicableUpdates.map((update) => ({
      id: update.id,
      title: update.title,
      effectiveDate: update.effectiveDate,
      reason: update.reason,
      source: update.source,
      newRequiredDocuments: update.newRequiredDocuments,
      changedFields: update.changedFields
    })),
    additionalRequiredDocuments,
    changedFields: [...new Set(applicableUpdates.flatMap((update) => update.changedFields))],
    recommendedAction: additionalRequiredDocuments.length
      ? `Request ${additionalRequiredDocuments.join(", ")} before the dossier advances.`
      : applicableUpdates.length
        ? "Review the dossier against the latest legal requirements before advancing."
        : "No legal change impact detected for the current phase.",
    systemAdaptation: buildSystemAdaptationPlan(dossier, {
      hasImpact: applicableUpdates.length > 0,
      additionalRequiredDocuments,
      changedFields: [...new Set(applicableUpdates.flatMap((update) => update.changedFields))],
      phase: normalizePhaseForUi(dossier.phase)
    }),
    alert:
      applicableUpdates.length > 0
        ? "Legal requirements changed for this dossier phase."
        : null
  };
}

export async function adaptDossierToLegalChanges(dossierId) {
  const dossier = await prisma.dossier.findUnique({
    where: { id: Number(dossierId) }
  });
  if (!dossier) return null;

  const impact = evaluateLegalChangeImpact(dossier);
  const currentMissingFields = parseJson(dossier.missingFieldsJson, []);
  const nextMissingFields = [
    ...currentMissingFields,
    ...impact.additionalRequiredDocuments.filter(
      (document) =>
        !currentMissingFields.some(
          (field) => String(field).toLowerCase() === String(document).toLowerCase()
        )
    )
  ];

  const nextRiskLevel =
    impact.systemAdaptation.riskAdjustment === "increase" && dossier.riskLevel !== "high"
      ? dossier.riskLevel === "low"
        ? "medium"
        : "high"
      : dossier.riskLevel === "low" && impact.hasImpact
        ? "medium"
        : dossier.riskLevel;

  const shouldUpdate = nextMissingFields.length !== currentMissingFields.length || nextRiskLevel !== dossier.riskLevel;
  const updatedDossier = shouldUpdate
    ? await prisma.dossier.update({
        where: { id: dossier.id },
        data: {
          missingFieldsJson: toJson(nextMissingFields),
          riskLevel: nextRiskLevel
        }
      })
    : dossier;

  return {
    dossierId: dossier.id,
    adapted: shouldUpdate,
    requestedDocuments: impact.additionalRequiredDocuments,
    missingFields: nextMissingFields,
    legalChangeImpact: impact,
    userAlert: buildLegalChangeUserAlert(impact),
    dossier: updatedDossier
  };
}
