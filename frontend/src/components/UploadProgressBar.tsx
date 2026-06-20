import type { UploadStatus } from '../hooks/useDocumentUpload';
import './UploadProgressBar.css';

interface UploadProgressBarProps {
  status: UploadStatus;
  progress: number;
}

export function UploadProgressBar({ status, progress }: UploadProgressBarProps) {
  if (status === 'idle') return null;

  const width = status === 'success' ? 100 : progress;

  return (
    <div className="upload-progress">
      <div className="upload-progress__track">
        <div
          className={`upload-progress__fill upload-progress__fill--${status}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="upload-progress__label">
        {status === 'uploading' && `Uploading… ${progress}%`}
        {status === 'success' && 'Upload complete'}
        {status === 'error' && 'Upload failed'}
      </span>
    </div>
  );
}
