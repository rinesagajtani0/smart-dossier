import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgressBar } from '../components/UploadProgressBar';
import { ExtractionResultPanel } from '../components/ExtractionResultPanel';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import './DocumentUploadPage.css';

export function DocumentUploadPage() {
  const [dossierId, setDossierId] = useState('1');
  const [fileName, setFileName] = useState<string | null>(null);
  const { status, progress, result, error, upload, reset } = useDocumentUpload();

  function handleFileSelected(file: File) {
    setFileName(file.name);
    upload(dossierId, file);
  }

  function handleDossierIdChange(value: string) {
    setDossierId(value);
    setFileName(null);
    reset();
  }

  return (
    <div className="document-upload-page">
      <Link to="/" className="document-upload-page__back">
        ← Back to workflow
      </Link>

      <header className="document-upload-page__header">
        <h1>Document Upload & NLP Extraction</h1>
        <p>Attach a supporting document to a dossier and let the extraction engine pull out its fields.</p>
      </header>

      <label className="document-upload-page__dossier-field">
        <span>Dossier ID</span>
        <input
          type="text"
          value={dossierId}
          onChange={(event) => handleDossierIdChange(event.target.value)}
          disabled={status === 'uploading'}
        />
        <small>Try any dossier ID from 1–24.</small>
      </label>

      <FileDropzone
        onFileSelected={handleFileSelected}
        disabled={status === 'uploading'}
        selectedFileName={fileName}
      />

      <UploadProgressBar status={status} progress={progress} />

      {error && (
        <p className="document-upload-page__status document-upload-page__status--error">{error}</p>
      )}

      {result && <ExtractionResultPanel data={result.extractedData} />}
    </div>
  );
}
