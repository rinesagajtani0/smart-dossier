import { formatShortDate } from '../utils/date';
import './LetterPreview.css';

interface LetterPreviewProps {
  content: string;
  createdAt: string;
}

export function LetterPreview({ content, createdAt }: LetterPreviewProps) {
  return (
    <div className="letter-preview">
      <span className="letter-preview__stamp">Generated</span>
      <div className="letter-preview__letterhead">
        <span className="letter-preview__seal" aria-hidden="true">
          ✦
        </span>
        <div>
          <strong>Smart Dossier AI</strong>
          <p>Administrative Correspondence</p>
        </div>
        <time className="letter-preview__date">{formatShortDate(createdAt)}</time>
      </div>
      <pre className="letter-preview__body">{content}</pre>
    </div>
  );
}
