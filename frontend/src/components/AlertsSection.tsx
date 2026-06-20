import type { UserAlert } from '../types/dossier';
import { AlertCard } from './AlertCard';
import './AlertsSection.css';

interface AlertsSectionProps {
  alerts: UserAlert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  return (
    <section className="dossier-detail__section">
      <h2>Alerts</h2>
      {alerts.length === 0 ? (
        <p className="dossier-detail__empty">No active alerts.</p>
      ) : (
        <div className="alerts-section__list">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </section>
  );
}
