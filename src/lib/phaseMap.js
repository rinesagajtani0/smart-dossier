const PHASE_TO_UI = new Map([
  ["Kërkesë Filluese", "Intake"],
  ["KÃ«rkesÃ« Filluese", "Intake"],
  ["Verifikim Kadastral", "ASHK Check"],
  ["Vlerësim i Pronës", "Property Valuation"],
  ["VlerÃ«sim i PronÃ«s", "Property Valuation"],
  ["Rishikim Ligjor", "Legal Review"],
  ["Miratim dhe Regjistrim", "Final Approval"]
]);

const INSTITUTION_TO_UI = new Map([
  ["ASHK", "ASHK"]
]);

export function normalizePhaseForUi(phase) {
  return PHASE_TO_UI.get(phase) || phase;
}

export function normalizeInstitutionForUi(institution) {
  return INSTITUTION_TO_UI.get(institution) || institution;
}
