import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExtractionResultPanel } from '../components/ExtractionResultPanel';
import { useNlpExtraction } from '../hooks/useNlpExtraction';
import { usePersistentState } from '../state/usePersistentState';
import './NlpExtractionPage.css';

export function NlpExtractionPage() {
  const [searchParams] = useSearchParams();
  const initialDocumentId = searchParams.get('documentId') ?? '';
  const [documentId, setDocumentId] = usePersistentState('nlp-extraction:documentId', initialDocumentId);
  const { result, loading, error, extract } = useNlpExtraction();

  useEffect(() => {
    // An explicit ?documentId= link (e.g. from Document Upload) always wins
    // over whatever's persisted — but only run the extraction if we don't
    // already have a result for that same document, so coming back to this
    // page doesn't silently re-trigger a fetch for data we already have.
    if (!initialDocumentId) return;
    if (initialDocumentId !== documentId) setDocumentId(initialDocumentId);
    if (!result || String(result.id) !== initialDocumentId) extract(initialDocumentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDocumentId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    extract(documentId);
  }

  return (
    <div className="nlp-extraction-page">
      <Link to="/" className="nlp-extraction-page__back">
        ← Back to workflow
      </Link>

      <header className="nlp-extraction-page__header">
        <h1>NLP Extraction</h1>
        <p>Run field extraction on an already-uploaded document and inspect the results.</p>
      </header>

      <form className="nlp-extraction-page__form" onSubmit={handleSubmit}>
        <label>
          <span>Document ID</span>
          <input
            type="text"
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            disabled={loading}
            placeholder="e.g. 1"
          />
        </label>
        <button type="submit" disabled={loading || !documentId}>
          {loading ? 'Extracting…' : 'Extract Fields'}
        </button>
        <small>Upload a document first, or enter an existing document ID.</small>
      </form>

      {error && <p className="nlp-extraction-page__status nlp-extraction-page__status--error">{error}</p>}

      {result && <ExtractionResultPanel data={result.extractedData} />}
    </div>
  );
}
