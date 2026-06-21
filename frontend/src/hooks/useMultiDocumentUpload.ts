import { useCallback } from 'react';
import { uploadDossierDocument } from '../services/dossierService';
import type { UploadedDocumentResult } from '../services/dossierService';
import type { UploadStatus } from './useDocumentUpload';
import { usePersistentState } from '../state/usePersistentState';

export interface DocumentUploadState {
  status: UploadStatus;
  progress: number;
  fileName: string | null;
  fileSize: number | null;
  result: UploadedDocumentResult | null;
  error: string | null;
}

const IDLE_STATE: DocumentUploadState = {
  status: 'idle',
  progress: 0,
  fileName: null,
  fileSize: null,
  result: null,
  error: null,
};

interface UseMultiDocumentUploadResult {
  getState: (documentName: string) => DocumentUploadState;
  upload: (documentName: string, dossierId: string, file: File) => void;
  clear: (documentName: string) => void;
}

// One dossier, many required documents: each upload box needs its own
// status/progress/result instead of the single shared state useDocumentUpload
// tracks, but every box still uploads through the same dossier-documents
// endpoint. Keyed by document name since that's the only identifier each
// box has (the backend has no per-required-document slot to upload into).
export function useMultiDocumentUpload(): UseMultiDocumentUploadResult {
  const [uploads, setUploads] = usePersistentState<Record<string, DocumentUploadState>>(
    'document-upload:multiUploads',
    {}
  );

  const upload = useCallback((documentName: string, dossierId: string, file: File) => {
    setUploads((prev) => ({
      ...prev,
      [documentName]: {
        status: 'uploading',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        result: null,
        error: null,
      },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = useCallback(
    (documentName: string) => {
      setUploads((prev) => {
        const next = { ...prev };
        delete next[documentName];
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const getState = useCallback((documentName: string) => uploads[documentName] ?? IDLE_STATE, [uploads]);

  return { getState, upload, clear };
}
