import { FileDropzone } from './FileDropzone';
import { UploadProgressBar } from './UploadProgressBar';
import type { DocumentUploadState } from '../hooks/useMultiDocumentUpload';
import './RequiredDocumentUploadField.css';

interface RequiredDocumentUploadFieldProps {
  documentName: string;
  state: DocumentUploadState;
  onFileSelected: (file: File) => void;
}

export function RequiredDocumentUploadField({ documentName, state, onFileSelected }: RequiredDocumentUploadFieldProps) {
  return (
    <div className="required-document-field">
      <span className="required-document-field__label">{documentName}</span>

      <FileDropzone
        onFileSelected={onFileSelected}
        disabled={state.status === 'uploading'}
        selectedFileName={state.fileName}
      />

      <UploadProgressBar status={state.status} progress={state.progress} />

      {state.error && (
        <p className="required-document-field__status required-document-field__status--error">{state.error}</p>
      )}

      {state.result && (
        <p className="required-document-field__status required-document-field__status--success">
          Uploaded as document #{state.result.id}.
        </p>
      )}
    </div>
  );
}
