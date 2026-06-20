import { Link } from 'react-router-dom';
import type { KanbanCardSummary } from '../types/dossier';
import { RiskBadge } from './PhaseBadge';
import { LegalChangeBadge } from './LegalChangeBadge';
import { formatShortDate, isOverdue } from '../utils/date';
import './KanbanCard.css';

interface KanbanCardProps {
  card: KanbanCardSummary;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const overdue = isOverdue(card.deadline, card.status);
  const subtitle = [card.propertyType, card.propertyLocation].filter(Boolean).join(' · ');

  return (
    <Link to={`/dossiers/${card.id}`} className="kanban-card">
      <div className="kanban-card__header">
        <h4>{card.title}</h4>
        <div className="kanban-card__badges">
          <RiskBadge riskLevel={card.riskLevel} />
          {card.legalChangeImpact && <LegalChangeBadge />}
        </div>
      </div>
      {card.applicantName && <p className="kanban-card__meta">{card.applicantName}</p>}
      {subtitle && <p className="kanban-card__meta">{subtitle}</p>}
      {card.missingFields.length > 0 && (
        <p className="kanban-card__missing">Missing: {card.missingFields.join(', ')}</p>
      )}
      <div className="kanban-card__footer">
        <span className={overdue ? 'kanban-card__deadline kanban-card__deadline--overdue' : 'kanban-card__deadline'}>
          {overdue ? 'Overdue' : 'Due'} {formatShortDate(card.deadline)}
        </span>
      </div>
    </Link>
  );
}
