import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgressBar } from '../components/UploadProgressBar';
import { UploadedFileMeta } from '../components/UploadedFileMeta';
import { AiProcessingTimeline } from '../components/AiProcessingTimeline';
import { RequiredDocumentUploadField } from '../components/RequiredDocumentUploadField';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { CitizenApplicationSubmission } from '../components/CitizenApplicationSubmission';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useMultiDocumentUpload } from '../hooks/useMultiDocumentUpload';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import { useApplicationSubmission } from '../hooks/useApplicationSubmission';
import { getProcedureSession } from '../services/processService';
import { usePersistentState } from '../state/usePersistentState';
import { Can } from '../auth/Can';
import './DocumentUploadPage.css';

export function DocumentUploadPage() {
  const [searchParams] = useSearchParams();
  const preparedDossierId = searchParams.get('dossierId') ?? undefined;
  const { dossierId, setDossierId, hint } = useDefaultDossierId('document-upload', preparedDossierId);

  // The Procedure Generator hands off its generated procedure + required
  // documents through sessionStorage (see processService.saveProcedureSession).
  // Only trust it while it still points at the dossier currently loaded —
  // if the user types in a different dossier id, fall back to the original
  // single generic upload below instead of showing a stale document list.
  const [session] = useState(() => getProcedureSession());
  const requiredDocuments =
    session && session.dossierId === dossierId ? session.procedure.requiredDocuments : null;

  const [fileName, setFileName] = usePersistentState<string | null>('document-upload:fileName', null);
  const [fileSize, setFileSize] = usePersistentState<number | null>('document-upload:fileSize', null);
  const { status, progress, result, error, upload, reset } = useDocumentUpload();
  const { getState, upload: uploadRequiredDocument, clear: clearRequiredDocument } = useMultiDocumentUpload();
  // Whether this dossier was already submitted in an earlier visit — the
  // upload result/progress above resets on reload, but the citizen still
  // needs to see "Submitted - Awaiting Staff Review" when they come back.
  const { submitted } = useApplicationSubmission(dossierId);

  function handleFileSelected(file: File) {
    setFileName(file.name);
    setFileSize(file.size);
    upload(dossierId, file);
  }

  function handleRemoveFile() {
    setFileName(null);
    setFileSize(null);
    reset();
  }

  function handleDossierIdChange(value: string) {
    setDossierId(value);
    handleRemoveFile();
  }

  return (
    <div className="document-upload-page">
      <Link to="/" className="document-upload-page__back">
        ← Back to workflow
      </Link>

      <section className="document-upload-page__hero">
        <span className="document-upload-page__hero-badge">✨ AI-Powered Document Processing</span>
        <h1>Upload Property Documents</h1>
        <p>Upload and analyze documents using AI-powered OCR and NLP extraction.</p>
      </section>

      <div className={`document-upload-page__layout${requiredDocuments ? ' document-upload-page__layout--split' : ''}`}>
        <div className="document-upload-page__main">
          <label className="document-upload-page__dossier-field">
            <span>Dossier ID</span>
            <input
              type="text"
              value={dossierId}
              onChange={(event) => handleDossierIdChange(event.target.value)}
              disabled={status === 'uploading'}
            />
            <small>{hint}</small>
          </label>

          {requiredDocuments ? (
            <>
              <div className="document-upload-page__required-fields">
                {requiredDocuments.map((documentName) => (
                  <RequiredDocumentUploadField
                    key={documentName}
                    documentName={documentName}
                    state={getState(documentName)}
                    onFileSelected={(file) => uploadRequiredDocument(documentName, dossierId, file)}
                    onRemove={() => clearRequiredDocument(documentName)}
                  />
                ))}
              </div>

              {(submitted || requiredDocuments.some((documentName) => getState(documentName).result)) && (
                <Can permission="view-nlp-extraction" fallback={
                  <CitizenApplicationSubmission
                    dossierId={dossierId}
                    uploadedDocuments={requiredDocuments.filter((documentName) => getState(documentName).result)}
                    readyToSubmit={requiredDocuments.every((documentName) => getState(documentName).result)}
                  />
                }>
                  {null}
                </Can>
              )}
            </>
          ) : (
            <>
              {fileName ? (
                <UploadedFileMeta
                  fileName={fileName}
                  fileSize={fileSize}
                  uploadedAt={result?.uploadedAt ?? null}
                  previewText={result?.extractedText}
                  onRemove={handleRemoveFile}
                  removeDisabled={status === 'uploading'}
                />
              ) : (
                <FileDropzone onFileSelected={handleFileSelected} disabled={status === 'uploading'} selectedFileName={null} />
              )}

              <UploadProgressBar status={status} progress={progress} />

              {error && (
                <p className="document-upload-page__status document-upload-page__status--error">{error}</p>
              )}

              {result && (
                <div className="document-upload-page__ready">
                  <p className="document-upload-page__status document-upload-page__status--success">
                    ✓ Ready for AI Analysis
                  </p>
                  <AiProcessingTimeline />
                </div>
              )}

              {(result || submitted) && (
                <Can
                  permission="view-nlp-extraction"
                  fallback={
                    <CitizenApplicationSubmission
                      dossierId={dossierId}
                      uploadedDocuments={result ? [fileName ?? `Document #${result.id}`] : []}
                      readyToSubmit={Boolean(result)}
                    />
                  }
                >
                  {result && (
                    <div className="document-upload-page__success">
                      <p>
                        Document <strong>#{result.id}</strong> uploaded to dossier {result.dossierId}.
                      </p>
                      <Link to={`/nlp-extraction?documentId=${result.id}`} className="document-upload-page__success-link">
                        View NLP Extraction results →
                      </Link>
                    </div>
                  )}
                </Can>
              )}
            </>
          )}
        </div>

        {requiredDocuments && (
          <DocumentSummaryPanel
            dossierId={dossierId}
            documents={requiredDocuments.map((documentName) => ({
              name: documentName,
              uploaded: Boolean(getState(documentName).result),
            }))}
          />
        )}
      </div>
    </div>
  );
}
