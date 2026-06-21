import { FileDropzone } from './FileDropzone';
import { UploadProgressBar } from './UploadProgressBar';
import { UploadedFileMeta } from './UploadedFileMeta';
import { AiProcessingTimeline } from './AiProcessingTimeline';
import { getDocumentIcon } from '../utils/documentIcon';
import type { DocumentUploadState } from '../hooks/useMultiDocumentUpload';
import './RequiredDocumentUploadField.css';

interface RequiredDocumentUploadFieldProps {
  documentName: string;
  state: DocumentUploadState;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

export function RequiredDocumentUploadField({
  documentName,
  state,
  onFileSelected,
  onRemove,
}: RequiredDocumentUploadFieldProps) {
  const hasFile = state.status !== 'idle' && Boolean(state.fileName);

  return (
    <div
      className={`required-document-field${state.status === 'success' ? ' required-document-field--success' : ''}`}
    >
      <span className="required-document-field__label">
        <span className="required-document-field__icon" aria-hidden="true">
          {getDocumentIcon(documentName)}
        </span>
        {documentName}
      </span>

      {hasFile && state.fileName ? (
        // Once a file is attached, the meta card replaces the dropzone — to
        // replace the file, remove it first (the dropzone reappears) rather
        // than showing both at once.
        <UploadedFileMeta
          fileName={state.fileName}
          fileSize={state.fileSize}
          uploadedAt={state.result?.uploadedAt ?? null}
          previewText={state.result?.extractedText}
          onRemove={onRemove}
          removeDisabled={state.status === 'uploading'}
        />
      ) : (
        <FileDropzone onFileSelected={onFileSelected} disabled={false} selectedFileName={null} />
      )}

      <UploadProgressBar status={state.status} progress={state.progress} />

      {state.error && (
        <p className="required-document-field__status required-document-field__status--error">{state.error}</p>
      )}

      {state.result && (
        <div className="required-document-field__ready">
          <p className="required-document-field__status required-document-field__status--success">
            ✓ Ready for AI Analysis
          </p>
          <AiProcessingTimeline />
        </div>
      )}
    </div>
  );
}
