import { parseJson } from "./json.js";

export function trackingCodeFor(dossier) {
  return dossier.title?.split(" - ").at(0) || `DOS-${dossier.id}`;
}

export function presentDossier(dossier) {
  return {
    ...dossier,
    trackingCode: trackingCodeFor(dossier),
    missingFields: parseJson(dossier.missingFieldsJson, []),
    documents: dossier.documents?.map((doc) => ({
      ...doc,
      extractedData: parseJson(doc.extractedDataJson, {})
    })),
    caseHistory: dossier.caseHistory
      ? {
          ...dossier.caseHistory,
          similarityTags: parseJson(dossier.caseHistory.similarityTagsJson, [])
        }
      : null
  };
}

export function presentStaffDossier(dossier) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);

  return {
    id: dossier.id,
    trackingCode: trackingCodeFor(dossier),
    title: dossier.title,
    processType: dossier.processType,
    applicantName: dossier.applicantName,
    ownerName: dossier.ownerName,
    propertyLocation: dossier.propertyLocation,
    propertyNumber: dossier.propertyNumber,
    cadastralZone: dossier.cadastralZone,
    propertyType: dossier.propertyType,
    phase: dossier.phase,
    institution: dossier.institution,
    status: dossier.status,
    deadline: dossier.deadline,
    riskLevel: dossier.riskLevel,
    missingFields,
    needsAttention: dossier.riskLevel === "high" || missingFields.length > 0,
    updatedAt: dossier.updatedAt
  };
}

export function presentCitizenDossier(dossier, processStep) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);

  return {
    trackingCode: trackingCodeFor(dossier),
    title: dossier.title,
    processType: dossier.processType,
    applicantName: dossier.applicantName,
    propertyLocation: dossier.propertyLocation,
    phase: dossier.phase,
    institution: dossier.institution,
    status: dossier.status,
    deadline: dossier.deadline,
    nextStep: processStep?.nextPhase
      ? `The dossier is expected to move to ${processStep.nextPhase}.`
      : "The dossier is in the final step.",
    citizenMessage: missingFields.length
      ? `Action needed: please provide ${missingFields.join(", ")}.`
      : "No citizen action is currently required.",
    publicRiskLabel: dossier.riskLevel === "high" ? "may be delayed" : "on track"
  };
}
