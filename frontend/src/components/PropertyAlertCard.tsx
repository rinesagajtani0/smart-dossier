import { useState } from 'react';
import type { PropertyAlert } from '../services/propertyAlertService';
import { Can } from '../auth/Can';
import './PropertyAlertCard.css';

interface PropertyAlertCardProps {
  alert: PropertyAlert;
}

const DEMOLITION_RISK_MESSAGE = 'This property may be affected by demolition or infrastructure intervention.';

export function PropertyAlertCard({ alert }: PropertyAlertCardProps) {
  const [userNotified, setUserNotified] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const isDemolitionRisk = alert.type === 'demolition-risk';

  return (
    <div className={`property-alert-card${isDemolitionRisk ? ' property-alert-card--demolition-risk' : ''}`}>
      {isDemolitionRisk && (
        <div className="property-alert-card__warning" role="alert">
          <span aria-hidden="true">⚠</span> {DEMOLITION_RISK_MESSAGE}
        </div>
      )}

      <div className="property-alert-card__header">
        {alert.title && <h4 className="property-alert-card__title">{alert.title}</h4>}
        <span className="property-alert-card__type">{alert.type}</span>
      </div>

      {alert.message && <p className="property-alert-card__message">{alert.message}</p>}

      {alert.shouldNotifyUser && (
        // Notifying/alerting is a staff action on someone else's behalf —
        // a citizen viewing their own dossier shouldn't see it.
        <Can permission="manage-dossiers">
          <div className="property-alert-card__actions">
            <button
              type="button"
              className="property-alert-card__button property-alert-card__button--primary"
              onClick={() => setUserNotified(true)}
              disabled={userNotified}
            >
              {userNotified ? 'User Notified' : 'Notify User'}
            </button>
            <button
              type="button"
              className="property-alert-card__button property-alert-card__button--secondary"
              onClick={() => setAlertSent(true)}
              disabled={alertSent}
            >
              {alertSent ? 'Alert Sent' : 'Send Alert'}
            </button>
          </div>
        </Can>
      )}
    </div>
  );
}
