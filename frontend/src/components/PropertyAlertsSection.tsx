import { usePropertyAlerts } from '../hooks/usePropertyAlerts';
import { PropertyAlertCard } from './PropertyAlertCard';
import './PropertyAlertsSection.css';

interface PropertyAlertsSectionProps {
  propertyNumber: string | null;
}

export function PropertyAlertsSection({ propertyNumber }: PropertyAlertsSectionProps) {
  const { alerts, loading, error } = usePropertyAlerts(propertyNumber);

  if (!propertyNumber) {
    return null;
  }

  return (
    <section className="dossier-detail__section">
      <h2>Property Alerts</h2>

      {loading && <p className="dossier-detail__empty">Loading property alerts…</p>}

      {!loading && error && <p className="dossier-detail__status--error">{error}</p>}

      {!loading && !error && alerts.length === 0 && <p className="dossier-detail__empty">No property alerts.</p>}

      {!loading && !error && alerts.length > 0 && (
        <div className="property-alerts-section__list">
          {alerts.map((alert) => (
            <PropertyAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </section>
  );
}
