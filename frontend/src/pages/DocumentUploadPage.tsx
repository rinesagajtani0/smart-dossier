import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgressBar } from '../components/UploadProgressBar';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { Can } from '../auth/Can';
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
        <h1>Document Upload</h1>
        <p>Attach a supporting document to a dossier, with drag &amp; drop or a file picker.</p>
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

      {result && (
        <div className="document-upload-page__success">
          <Can
            permission="view-nlp-extraction"
            fallback={
              <>
                <h2 className="document-upload-page__success-title">Application Submitted</h2>
                <p>Your documents have been received and are being processed.</p>
              </>
            }
          >
            <p>
              Document <strong>#{result.id}</strong> uploaded to dossier {result.dossierId}.
            </p>
            <Link to={`/nlp-extraction?documentId=${result.id}`} className="document-upload-page__success-link">
              View NLP Extraction results →
            </Link>
          </Can>
        </div>
      )}
    </div>
  );
}
