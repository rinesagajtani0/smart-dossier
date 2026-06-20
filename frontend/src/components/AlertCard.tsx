import type { UserAlert } from '../types/dossier';
import './AlertCard.css';

interface AlertCardProps {
  alert: UserAlert;
}

const URGENT_SEVERITIES = new Set(['critical', 'high']);

export function AlertCard({ alert }: AlertCardProps) {
  const isUrgent = URGENT_SEVERITIES.has(alert.severity);

  return (
    <div className={`alert-card alert-card--${alert.severity}`} role={isUrgent ? 'alert' : undefined}>
      {isUrgent && (
        <span className="alert-card__urgent-flag" aria-hidden="true">
          ⚠ URGENT
        </span>
      )}
      <div className="alert-card__header">
        <h3 className="alert-card__title">{alert.title}</h3>
        <span className={`alert-card__severity alert-card__severity--${alert.severity}`}>{alert.severity}</span>
      </div>
      <p className="alert-card__message">{alert.message}</p>
      <span className="alert-card__type">{alert.type}</span>
    </div>
  );
}
