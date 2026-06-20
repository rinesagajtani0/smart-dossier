import { localizeText, mapLocationToAlbania } from '../utils/albania';
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
  const result = await request<ExtractDocumentResult>(`/nlp/extract/${documentId}`, { method: 'POST' });
  return {
    ...result,
    extractedData: {
      ...result.extractedData,
      propertyLocation: mapLocationToAlbania(result.extractedData.propertyLocation),
      cadastralZone: localizeText(result.extractedData.cadastralZone),
    },
  };
}

export async function getDossierSummary(dossierId: string): Promise<DossierSummaryResult> {
  const result = await request<DossierSummaryResult>(`/nlp/summary/${dossierId}`);
  return { summary: localizeText(result.summary) };
}

export async function askDossierQuestion(dossierId: string, question?: string): Promise<DossierAskResult> {
  const result = await postJson<DossierAskResult>(`/nlp/ask/${dossierId}`, { question });
  return { ...result, answer: localizeText(result.answer) };
}
