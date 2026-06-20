import { askJson } from "./ai.js";
import { ALBANIAN_LEGAL_BASIS, getLegalBasisForProcess } from "./albanianLegalBasis.js";
import { applyLegalUpdatesToProcessStep } from "./legalEngine.js";

function classifyIntent(intent) {
  const value = intent.toLowerCase();
  if (value.includes("expropriation") || value.includes("shprones")) return "expropriation";
  if (value.includes("ekb") || value.includes("privatization") || value.includes("privatiz")) {
    return "ekb-privatization";
  }
  return "property-registration";
}

function getProcessTemplate(processType) {
  return (
    Object.values(ALBANIAN_LEGAL_BASIS.processTemplates).find((item) => item.id === processType) ||
    ALBANIAN_LEGAL_BASIS.processTemplates.propertyRegistration
  );
}

export async function generateProcedure({ intent = "", municipality = "", propertyType = "" }) {
  const processType = classifyIntent(intent);
  const processTemplate = getProcessTemplate(processType);
  const legalBasis = getLegalBasisForProcess(processTemplate.id);
  const adaptedSteps = processTemplate.steps.map((step) => applyLegalUpdatesToProcessStep(processTemplate.id, step));
  const expectedDays = adaptedSteps.reduce((sum, step) => sum + step.expectedDays, 0);

  const template = {
    procedure: processTemplate.label,
    processType: processTemplate.id,
    steps: adaptedSteps.map((step) => ({
      phase: step.phase,
      institution: step.institution,
      expectedDays: step.expectedDays,
      requiredDocuments: step.requiredDocuments,
      criticalPoint: step.criticalPoint,
      nextPhase: step.nextPhase,
      legalChangeApplies: step.legalChangeApplies,
      legalUpdates: step.legalUpdates,
      changedFields: step.changedFields
    })),
    requiredDocuments: [...new Set(adaptedSteps.flatMap((step) => step.requiredDocuments))],
    expectedTimeline: `${expectedDays}-${Math.round(expectedDays * 1.35)} days`,
    institutions: [...new Set(processTemplate.steps.map((step) => step.institution))],
    relevantRules: legalBasis.map((law) => ({
      id: law.id,
      name: law.name,
      title: law.title,
      source: law.source
    })),
    risks: [
      ...ALBANIAN_LEGAL_BASIS.criticalPoints
      .filter((point) => point.processTypes.includes(processTemplate.id))
        .map((point) => point.alert),
      ...adaptedSteps
        .filter((step) => step.legalChangeApplies)
        .map((step) => `Legal update applies in ${step.phase}: ${step.addedRequiredDocuments.join(", ") || "field revalidation required"}.`)
    ]
  };

  return askJson(
    `Generate a property procedure plan for Albanian civil-service workflows.
Use only the provided structured process templates, legal basis, institutions, and critical points.
Return only JSON with this exact shape:
{
  "procedure": "",
  "processType": "",
  "steps": [{ "phase": "", "institution": "", "expectedDays": 0, "requiredDocuments": [], "criticalPoint": false, "nextPhase": "" }],
  "requiredDocuments": [],
  "expectedTimeline": "",
  "institutions": [],
  "relevantRules": [],
  "risks": [],
  "municipality": "",
  "propertyType": ""
}
Do not invent phases or legal rules that are not in the provided dataset.`,
    JSON.stringify({ intent, municipality, propertyType, template, knowledgeBase: ALBANIAN_LEGAL_BASIS }, null, 2),
    () => ({
      ...template,
      municipality: municipality || "not specified",
      propertyType: propertyType || "not specified",
      legalBasis,
      assumptions: [
        "Structured from the local Albanian property knowledge base.",
        "Challenge-provided diagrams should replace or refine the expropriation and EKB steps when available.",
        "No real integrations are used in this demo."
      ]
    })
  );
}
