import { Link, useParams } from 'react-router-dom';
import { useDossier } from '../hooks/useDossier';
import { PhaseBadge, RiskBadge } from '../components/PhaseBadge';
import { AlertsSection } from '../components/AlertsSection';
import { LegalChangePanel } from '../components/LegalChangePanel';
import { PhaseHoldModal } from '../components/PhaseHoldModal';
import { DeadlineReviewNotice } from '../components/DeadlineReviewNotice';
import { PropertyAlertsSection } from '../components/PropertyAlertsSection';
import { formatShortDate, isOverdue } from '../utils/date';
import './DossierDetailPage.css';

export function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { dossier, loading, error } = useDossier(id);

  if (loading) {
    return <p className="dossier-detail__status">Loading dossier…</p>;
  }

  if (error) {
    return <p className="dossier-detail__status dossier-detail__status--error">{error}</p>;
  }

  if (!dossier) {
    return (
      <div className="dossier-detail__status">
        <p>Dossier not found.</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="dossier-detail">
      <PhaseHoldModal legalChangeImpact={dossier.legalChangeImpact} />

      <Link to="/" className="dossier-detail__back">
        ← Back to dashboard
      </Link>

      <header className="dossier-detail__header">
        <div>
          <h1>{dossier.subject}</h1>
          <p className="dossier-detail__category">{dossier.category}</p>
        </div>
        <div className="dossier-detail__badges">
          <PhaseBadge phase={dossier.phase} />
          <RiskBadge riskLevel={dossier.riskLevel} />
        </div>
      </header>

      <AlertsSection alerts={dossier.userAlerts} />

      <LegalChangePanel
        alerts={dossier.userAlerts}
        requestedDocuments={dossier.requestedDocuments}
        changedFields={dossier.changedFields}
      />

      <DeadlineReviewNotice legalChangeImpact={dossier.legalChangeImpact} />

      <PropertyAlertsSection propertyNumber={dossier.propertyNumber} />

      <section className="dossier-detail__section">
        <h2>Summary</h2>
        <p>{dossier.summary}</p>
      </section>

      {dossier.tags.length > 0 && (
        <section className="dossier-detail__section">
          <h2>Tags</h2>
          <div className="dossier-detail__tags">
            {dossier.tags.map((tag) => (
              <span key={tag} className="dossier-detail__tag">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="dossier-detail__section">
        <h2>Timeline</h2>
        <ul className="dossier-detail__timeline">
          {dossier.events.map((event) => (
            <li key={event.id}>
              <span className="dossier-detail__timeline-date">{event.date}</span>
              <span>{event.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dossier-detail__section">
        <h2>Sources</h2>
        {dossier.sources.length === 0 ? (
          <p className="dossier-detail__empty">No sources recorded.</p>
        ) : (
          <ul className="dossier-detail__sources">
            {dossier.sources.map((source) => (
              <li key={source.id}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ) : (
                  source.label
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="dossier-detail__meta">
        <span>Created {dossier.createdAt}</span>
        <span>Updated {dossier.updatedAt}</span>
        <span className={isOverdue(dossier.deadline, dossier.status) ? 'dossier-detail__deadline--delayed' : undefined}>
          {isOverdue(dossier.deadline, dossier.status) ? 'Overdue' : 'Deadline'} {formatShortDate(dossier.deadline)}
        </span>
      </footer>
    </div>
  );
}
