import { useCallback, useState } from 'react';
import { uploadDossierDocument } from '../services/dossierService';
import type { UploadedDocumentResult } from '../services/dossierService';
import type { UploadStatus } from './useDocumentUpload';

export interface DocumentUploadState {
  status: UploadStatus;
  progress: number;
  fileName: string | null;
  result: UploadedDocumentResult | null;
  error: string | null;
}

const IDLE_STATE: DocumentUploadState = {
  status: 'idle',
  progress: 0,
  fileName: null,
  result: null,
  error: null,
};

interface UseMultiDocumentUploadResult {
  getState: (documentName: string) => DocumentUploadState;
  upload: (documentName: string, dossierId: string, file: File) => void;
}

// One dossier, many required documents: each upload box needs its own
// status/progress/result instead of the single shared state useDocumentUpload
// tracks, but every box still uploads through the same dossier-documents
// endpoint. Keyed by document name since that's the only identifier each
// box has (the backend has no per-required-document slot to upload into).
export function useMultiDocumentUpload(): UseMultiDocumentUploadResult {
  const [uploads, setUploads] = useState<Record<string, DocumentUploadState>>({});

  const upload = useCallback((documentName: string, dossierId: string, file: File) => {
    setUploads((prev) => ({
      ...prev,
      [documentName]: { status: 'uploading', progress: 0, fileName: file.name, result: null, error: null },
    }));

    uploadDossierDocument(dossierId, file, (percent) => {
      setUploads((prev) => ({
        ...prev,
        [documentName]: { ...prev[documentName], progress: percent },
      }));
    })
      .then((data) => {
        setUploads((prev) => ({
          ...prev,
          [documentName]: { ...prev[documentName], status: 'success', result: data },
        }));
      })
      .catch((err) => {
        setUploads((prev) => ({
          ...prev,
          [documentName]: {
            ...prev[documentName],
            status: 'error',
            error: err instanceof Error ? err.message : 'Upload failed.',
          },
        }));
      });
  }, []);

  const getState = useCallback((documentName: string) => uploads[documentName] ?? IDLE_STATE, [uploads]);

  return { getState, upload };
}
