import { parseJson } from "./json.js";

export function buildRecommendedAction(dossier, processStep) {
  const missingFields = parseJson(dossier.missingFieldsJson, []);
  if (missingFields.length) {
    return {
      type: "request-documents",
      label: `Request ${missingFields.join(", ")}`,
      reason: "The dossier cannot advance while required fields are missing."
    };
  }

  if (processStep?.criticalPoint) {
    return {
      type: "review-critical-point",
      label: `Review ${dossier.phase} carefully`,
      reason: "This phase is marked as a critical delay point in the process."
    };
  }

  return {
    type: processStep?.nextPhase ? "advance-phase" : "complete",
    label: processStep?.nextPhase ? `Move to ${processStep.nextPhase}` : "Prepare final closure",
    reason: processStep?.nextPhase
      ? "No missing fields are currently recorded."
      : "The dossier is already in the final process step."
  };
}
