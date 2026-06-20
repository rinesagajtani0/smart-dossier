export interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  description: string;
  accent: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'procedure-generator',
    number: 1,
    title: 'Procedure Generator',
    description: 'Builds the required step-by-step checklist for a case based on its process type.',
    accent: '#2563eb',
  },
  {
    id: 'document-upload',
    number: 2,
    title: 'Document Upload',
    description: 'Civil servants attach supporting documents directly to the dossier.',
    accent: '#0ea5e9',
  },
  {
    id: 'nlp-extraction',
    number: 3,
    title: 'NLP Extraction',
    description: 'Pulls structured fields out of uploaded documents, with a confidence score.',
    accent: '#7c3aed',
  },
  {
    id: 'case-memory',
    number: 4,
    title: 'Case Memory',
    description: 'Surfaces similar historical cases to inform decisions on the current dossier.',
    accent: '#0d9488',
  },
  {
    id: 'delay-prediction',
    number: 5,
    title: 'Delay Prediction',
    description: 'Estimates delay risk and the likely bottleneck phase from historical patterns.',
    accent: '#ea580c',
  },
  {
    id: 'prevent-delay',
    number: 6,
    title: 'Prevent Delay',
    description: 'Generates a prevent-delay letter requesting the missing items from the applicant.',
    accent: '#be185d',
  },
];
