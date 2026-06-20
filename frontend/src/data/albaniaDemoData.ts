// Dedicated, hand-authored Albania demo content for the Workflow page
// previews. This is explicit seed data — it is never derived from backend
// responses or from any Kosovo source data.

export const DEMO_PROCEDURE_PHASES = ['Intake', 'ASHK Check', 'Property Valuation', 'Legal Review', 'Final Approval'];

export interface DemoUploadedFile {
  fileName: string;
  status: string;
}

export const DEMO_UPLOADED_FILES: DemoUploadedFile[] = [
  { fileName: 'certifikate-pronesie.pdf', status: 'Uploaded' },
  { fileName: 'raport-vleresimi.pdf', status: 'Uploaded' },
];

export const DEMO_EXTRACTED_FIELDS = {
  applicant: 'Elona Hoxha',
  propertyNumber: 'Nr. 145/22, ZK Tiranë',
  confidence: '92%',
};

export interface DemoSimilarCase {
  caseId: string;
  matchPercent: number;
  outcome: 'Delayed' | 'Approved' | 'Rejected';
  reason?: string;
}

export const DEMO_SIMILAR_CASES: DemoSimilarCase[] = [
  { caseId: 'EXP-AL-044', matchPercent: 86, outcome: 'Delayed', reason: 'Mungesë raporti vlerësimi' },
  { caseId: 'EXP-AL-067', matchPercent: 78, outcome: 'Approved' },
  { caseId: 'EXP-AL-081', matchPercent: 71, outcome: 'Rejected', reason: 'Konflikt pronësie' },
];

export const DEMO_DELAY_PREDICTION = {
  risk: 'High',
  predictedDelay: '8–14 days',
  likelyBlockage: 'ASHK Check',
};

export const DEMO_LETTER_PREVIEW =
  '"...the dossier requires the following item(s): certifikatë pronësie (ownership certificate). Please submit the requested documentation to ASHK as soon as possible..."';
