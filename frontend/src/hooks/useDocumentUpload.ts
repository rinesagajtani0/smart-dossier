import { useCallback, useState } from 'react';
import { uploadDossierDocument } from '../services/dossierService';
import type { UploadedDocumentResult } from '../services/dossierService';

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
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadedDocumentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, upload, reset };
}
