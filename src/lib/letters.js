import { parseJson } from "./json.js";

export function buildPreventDelayLetter(dossier) {
  const missing = parseJson(dossier.missingFieldsJson, []);

  return [
    `Subject: Request to complete dossier ${dossier.title}`,
    "",
    `Dear ${dossier.applicantName || "Applicant"},`,
    "",
    `During the review phase "${dossier.phase}" at ${dossier.institution}, the dossier requires the following item(s): ${missing.join(", ") || "additional supporting documentation"}.`,
    "Please submit the requested documentation as soon as possible to prevent delay in the property procedure.",
    "",
    "Respectfully,",
    "Smart Dossier AI"
  ].join("\n");
}
