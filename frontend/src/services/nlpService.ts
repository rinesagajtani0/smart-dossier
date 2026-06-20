import { postJson, request } from './apiClient';

export interface ExtractedDocumentData {
  applicantName: string;
  ownerName: string;
  propertyNumber: string;
  cadastralZone: string;
  propertyLocation: string;
  documentType: string;
  issuingInstitution: string;
  documentDate: string;
  missingFields: string[];
  confidence: number;
}

export interface ExtractDocumentResult {
  id: number;
  dossierId: number;
  fileName: string;
  documentType: string;
  extractedText: string;
  extractedDataJson: string;
  uploadedAt: string;
  extractedData: ExtractedDocumentData;
}

export interface DossierSummaryResult {
  summary: string;
}

export interface DossierAskResult {
  question: string;
  answer: string;
}

export async function extractDocumentFields(documentId: string): Promise<ExtractDocumentResult> {
  return request<ExtractDocumentResult>(`/nlp/extract/${documentId}`, { method: 'POST' });
}

export async function getDossierSummary(dossierId: string): Promise<DossierSummaryResult> {
  return request<DossierSummaryResult>(`/nlp/summary/${dossierId}`);
}

export async function askDossierQuestion(dossierId: string, question?: string): Promise<DossierAskResult> {
  return postJson<DossierAskResult>(`/nlp/ask/${dossierId}`, { question });
}
