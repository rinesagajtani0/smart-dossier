import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileDropzone } from '../components/FileDropzone';
import { UploadProgressBar } from '../components/UploadProgressBar';
import { RequiredDocumentUploadField } from '../components/RequiredDocumentUploadField';
import { CitizenApplicationSubmission } from '../components/CitizenApplicationSubmission';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useMultiDocumentUpload } from '../hooks/useMultiDocumentUpload';
import { useDefaultDossierId } from '../hooks/useDefaultDossierId';
import { useApplicationSubmission } from '../hooks/useApplicationSubmission';
import { getProcedureSession } from '../services/processService';
import { Can } from '../auth/Can';
import './DocumentUploadPage.css';

export function DocumentUploadPage() {
  const [searchParams] = useSearchParams();
  const preparedDossierId = searchParams.get('dossierId') ?? undefined;
  const { dossierId, setDossierId, hint } = useDefaultDossierId(preparedDossierId);

  // The Procedure Generator hands off its generated procedure + required
  // documents through sessionStorage (see processService.saveProcedureSession).
  // Only trust it while it still points at the dossier currently loaded —
  // if the user types in a different dossier id, fall back to the original
  // single generic upload below instead of showing a stale document list.
  const [session] = useState(() => getProcedureSession());
  const requiredDocuments =
    session && session.dossierId === dossierId ? session.procedure.requiredDocuments : null;

  const [fileName, setFileName] = useState<string | null>(null);
  const { status, progress, result, error, upload, reset } = useDocumentUpload();
  const { getState, upload: uploadRequiredDocument } = useMultiDocumentUpload();
  // Whether this dossier was already submitted in an earlier visit — the
  // upload result/progress above resets on reload, but the citizen still
  // needs to see "Submitted - Awaiting Staff Review" when they come back.
  const { submitted } = useApplicationSubmission(dossierId);

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
          <FileDropzone
            onFileSelected={handleFileSelected}
            disabled={status === 'uploading'}
            selectedFileName={fileName}
          />

          <UploadProgressBar status={status} progress={progress} />

          {error && (
            <p className="document-upload-page__status document-upload-page__status--error">{error}</p>
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
  );
}
