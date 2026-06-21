import './UploadedFileMeta.css';

interface UploadedFileMetaProps {
  fileName: string;
  fileSize: number | null;
  uploadedAt: string | null;
  previewText?: string | null;
  onRemove: () => void;
  removeDisabled?: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeBadge(fileName: string): string {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : 'FILE';
}

function formatTimestamp(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function UploadedFileMeta({
  fileName,
  fileSize,
  uploadedAt,
  previewText,
  onRemove,
  removeDisabled = false,
}: UploadedFileMetaProps) {
  const timestamp = formatTimestamp(uploadedAt);

  return (
    <div className="uploaded-file-meta">
      <div className="uploaded-file-meta__row">
        <span className="uploaded-file-meta__badge">{fileTypeBadge(fileName)}</span>
        <div className="uploaded-file-meta__info">
          <span className="uploaded-file-meta__name">{fileName}</span>
          <span className="uploaded-file-meta__details">
            {formatFileSize(fileSize)}
            {timestamp && ` · ${timestamp}`}
          </span>
        </div>
        <button
          type="button"
          className="uploaded-file-meta__remove"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`Remove ${fileName}`}
        >
          ✕
        </button>
      </div>

      {previewText && <p className="uploaded-file-meta__preview">“{previewText.slice(0, 140).trim()}…”</p>}
    </div>
  );
}
