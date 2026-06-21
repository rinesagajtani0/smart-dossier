import { useCallback, useState } from 'react';
import { uploadDossierDocument } from '../services/dossierService';
import type { UploadedDocumentResult } from '../services/dossierService';
import { usePersistentState } from '../state/usePersistentState';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UseDocumentUploadResult {
  status: UploadStatus;
  progress: number;
  result: UploadedDocumentResult | null;
  error: string | null;
  upload: (dossierId: string, file: File) => void;
  reset: () => void;
}

export function useDocumentUpload(): UseDocumentUploadResult {
  // status/result/error persist across navigation (the whole point of this
  // hook visually "remembering" a finished upload); progress stays local —
  // it's only meaningful while an upload is actively in flight.
  const [status, setStatus] = usePersistentState<UploadStatus>('document-upload:status', 'idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = usePersistentState<UploadedDocumentResult | null>('document-upload:result', null);
  const [error, setError] = usePersistentState<string | null>('document-upload:error', null);

  const upload = useCallback((dossierId: string, file: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);
    setResult(null);

    uploadDossierDocument(dossierId, file, setProgress)
      .then((data) => {
        setResult(data);
        setStatus('success');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Upload failed.');
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, progress, result, error, upload, reset };
}
