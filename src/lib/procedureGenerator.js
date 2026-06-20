import { askJson } from "./ai.js";
import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";

function classifyIntent(intent) {
  const value = intent.toLowerCase();
  if (value.includes("transfer")) return "transfer";
  if (value.includes("valuation") || value.includes("vler")) return "valuation";
  if (value.includes("legalization") || value.includes("legaliz")) return "legalization";
  return "registration";
}

export async function generateProcedure({ intent = "", municipality = "", propertyType = "" }) {
  const templateKey = classifyIntent(intent);
  const phases = ALBANIAN_LEGAL_BASIS.processPhases[templateKey] || ALBANIAN_LEGAL_BASIS.processPhases.propertyRegistration;
  
  const template = {
    procedure: templateKey === 'legalization' ? 'Legalizimi i Ndërtimeve' : 
                templateKey === 'transfer' ? 'Transferimi i Pronës' : 
                templateKey === 'valuation' ? 'Vlerësimi i Pronës' : 'Regjistrimi i Pronës',
    steps: phases.map(step => ({
      phase: step.phase,
      institution: step.institution,
      expectedDays: step.expectedDays,
      requiredDocuments: step.requiredDocuments
    })),
    requiredDocuments: phases.flatMap(step => step.requiredDocuments),
    expectedTimeline: `${phases.reduce((sum, step) => sum + step.expectedDays, 0)}-${Math.round(phases.reduce((sum, step) => sum + step.expectedDays, 0) * 1.3)} days`,
    institutions: [...new Set(phases.map(step => step.institution))],
    relevantRules: ALBANIAN_LEGAL_BASIS.laws.map(law => law.name),
    risks: ALBANIAN_LEGAL_BASIS.criticalPoints.map(point => point.point)
  };

  return askJson(
    `Generate a property procedure plan for Albanian civil-service workflows based on actual Albanian laws and institutions.
Legal context: ${ALBANIAN_LEGAL_BASIS.legalContext}
Return only JSON with this exact shape:
{
  "procedure": "",
  "steps": [{ "phase": "", "institution": "", "expectedDays": 0, "requiredDocuments": [] }],
  "requiredDocuments": [],
  "expectedTimeline": "",
  "institutions": [],
  "relevantRules": [],
  "risks": [],
  "municipality": "",
  "propertyType": ""
}
Use the provided Albanian legal template as baseline and adapt it to the citizen intent. Reference actual Albanian laws like Law No. 111/2018, Law No. 33/2012, and Law No. 9482/2006.`,
    JSON.stringify({ intent, municipality, propertyType, template, albanianContext: ALBANIAN_LEGAL_BASIS }, null, 2),
    () => ({
      ...template,
      municipality: municipality || "e paspecifikuara",
      propertyType: propertyType || "e paspecifikuara",
      legalBasis: ALBANIAN_LEGAL_BASIS.laws.map(law => `${law.name}: ${law.title}`),
      assumptions: [
        "Based on actual Albanian property laws and institutions",
        "Procedures follow Law No. 111/2018 (On Cadastre), Law No. 33/2012, and Law No. 9482/2006",
        "Institutions include ASHK, Bashkia, Regional Councils, and Courts"
      ]
    })
  );
}
