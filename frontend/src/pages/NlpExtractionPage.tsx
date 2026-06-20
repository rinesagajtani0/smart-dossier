import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExtractionResultPanel } from '../components/ExtractionResultPanel';
import { useNlpExtraction } from '../hooks/useNlpExtraction';
import './NlpExtractionPage.css';

export function NlpExtractionPage() {
  const [searchParams] = useSearchParams();
  const initialDocumentId = searchParams.get('documentId') ?? '';
  const [documentId, setDocumentId] = useState(initialDocumentId);
  const { result, loading, error, extract } = useNlpExtraction();

  useEffect(() => {
    if (initialDocumentId) extract(initialDocumentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
