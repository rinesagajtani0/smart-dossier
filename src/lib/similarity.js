import { parseJson } from "./json.js";

function intersect(a, b) {
  const right = new Set(b.map((item) => String(item).toLowerCase()));
  return a.filter((item) => right.has(String(item).toLowerCase()));
}

export function scoreSimilarity(current, candidate) {
  let score = 0;
  const reasons = [];
  const currentMissing = parseJson(current.missingFieldsJson, []);
  const candidateMissing = parseJson(candidate.missingFieldsJson, []);
  const sharedMissing = intersect(currentMissing, candidateMissing);

  if (current.processType === candidate.processType) {
    score += 25;
    reasons.push("same process type");
  }
  if (current.phase === candidate.phase) {
    score += 20;
    reasons.push("same phase");
  }
  if (sharedMissing.length) {
    score += 25;
    reasons.push(`shared missing fields: ${sharedMissing.join(", ")}`);
  }
  if (current.propertyLocation && current.propertyLocation === candidate.propertyLocation) {
    score += 10;
    reasons.push("same municipality/location");
  }
  if (current.propertyType && current.propertyType === candidate.propertyType) {
    score += 10;
    reasons.push("same property type");
  }
  if (current.riskLevel === candidate.riskLevel || current.status === candidate.status) {
    score += 10;
    reasons.push("similar risk/status");
  }

  return { score: Math.min(score, 100), reasons };
}
