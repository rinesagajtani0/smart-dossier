import { getDocumentIcon } from '../utils/documentIcon';
import './DocumentSummaryPanel.css';

interface DocumentSummaryPanelProps {
  dossierId: string;
  documents: { name: string; uploaded: boolean }[];
}

export function DocumentSummaryPanel({ dossierId, documents }: DocumentSummaryPanelProps) {
  const uploadedCount = documents.filter((document) => document.uploaded).length;
  const completion = documents.length ? Math.round((uploadedCount / documents.length) * 100) : 0;
  const missing = documents.filter((document) => !document.uploaded);

  return (
    <aside className="document-summary-panel">
      <h2 className="document-summary-panel__title">
        <span aria-hidden="true">📊</span> Upload Summary
      </h2>

      <div className="document-summary-panel__stats">
        <div className="document-summary-panel__stat">
          <span className="document-summary-panel__stat-label">Dossier ID</span>
          <span className="document-summary-panel__stat-value">{dossierId || '—'}</span>
        </div>
        <div className="document-summary-panel__stat">
          <span className="document-summary-panel__stat-label">Uploaded</span>
          <span className="document-summary-panel__stat-value">
            {uploadedCount} / {documents.length}
          </span>
        </div>
      </div>

      <ul className="document-summary-panel__documents">
        {documents.map((document) => (
          <li
            key={document.name}
            className={`document-summary-panel__document${document.uploaded ? ' document-summary-panel__document--done' : ''}`}
          >
            <span className="document-summary-panel__document-icon" aria-hidden="true">
              {getDocumentIcon(document.name)}
            </span>
            <span className="document-summary-panel__document-name">{document.name}</span>
            <span aria-hidden="true">{document.uploaded ? '✓' : '✗'}</span>
          </li>
        ))}
      </ul>

      <div className="document-summary-panel__completion">
        <div className="document-summary-panel__completion-header">
          <span>Completion</span>
          <span>{completion}%</span>
        </div>
        <div className="document-summary-panel__completion-track">
          <div className="document-summary-panel__completion-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {missing.length > 0 && (
        <p className="document-summary-panel__missing">
          Missing: {missing.map((document) => document.name).join(', ')}
        </p>
      )}
    </aside>
  );
}
