import type { UserAlert } from '../types/dossier';
import './LegalChangePanel.css';

interface LegalChangePanelProps {
  alerts: UserAlert[];
  requestedDocuments: string[];
  changedFields: string[];
}

export function LegalChangePanel({ alerts, requestedDocuments, changedFields }: LegalChangePanelProps) {
  const legalChangeAlerts = alerts.filter((alert) => alert.type === 'legal-change');

  if (legalChangeAlerts.length === 0) {
    return null;
  }

  return (
    <section className="legal-change-panel" role="alert">
      <div className="legal-change-panel__header">
        <span className="legal-change-panel__icon" aria-hidden="true">
          ⚖
        </span>
        <h2 className="legal-change-panel__title">Legal Change Detected</h2>
      </div>

      <ul className="legal-change-panel__warnings">
        {legalChangeAlerts.map((alert) => (
          <li key={alert.id} className="legal-change-panel__warning">
            <p className="legal-change-panel__warning-title">{alert.title}</p>
            <p className="legal-change-panel__warning-message">{alert.message}</p>
          </li>
        ))}
      </ul>

      <div className="legal-change-panel__details">
        <div className="legal-change-panel__group">
          <h3>Additional Required Documents</h3>
          {requestedDocuments.length === 0 ? (
            <p className="legal-change-panel__empty">None requested.</p>
          ) : (
            <ul className="legal-change-panel__list">
              {requestedDocuments.map((document) => (
                <li key={document}>{document}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="legal-change-panel__group">
          <h3>Fields Requiring Review</h3>
          {changedFields.length === 0 ? (
            <p className="legal-change-panel__empty">None flagged.</p>
          ) : (
            <ul className="legal-change-panel__list">
              {changedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
