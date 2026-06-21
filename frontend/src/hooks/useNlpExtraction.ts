import { useCallback, useState } from 'react';
import { extractDocumentFields } from '../services/nlpService';
import type { ExtractDocumentResult } from '../services/nlpService';
import { usePersistentState } from '../state/usePersistentState';

interface UseNlpExtractionResult {
  result: ExtractDocumentResult | null;
  loading: boolean;
  error: string | null;
  extract: (documentId: string) => void;
}

export function useNlpExtraction(): UseNlpExtractionResult {
  const [result, setResult] = usePersistentState<ExtractDocumentResult | null>('nlp-extraction:result', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback((documentId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    extractDocumentFields(documentId)
      .then((data) => setResult(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not extract fields for that document.');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { result, loading, error, extract };
}
