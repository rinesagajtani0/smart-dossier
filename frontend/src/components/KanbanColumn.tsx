import type { KanbanCardSummary, Phase } from '../types/dossier';
import { slugifyPhase } from '../utils/phase';
import { KanbanCard } from './KanbanCard';
import './KanbanColumn.css';

interface KanbanColumnProps {
  phase: Phase;
  title: string;
  cards: KanbanCardSummary[];
}

export function KanbanColumn({ phase, title, cards }: KanbanColumnProps) {
  return (
    <div className={`kanban-column kanban-column--${slugifyPhase(phase)}`}>
      <div className="kanban-column__header">
        <h3>{title}</h3>
        <span className="kanban-column__count">{cards.length}</span>
      </div>
      <div className="kanban-column__cards">
        {cards.length === 0 ? (
          <p className="kanban-column__empty">No dossiers</p>
        ) : (
          cards.map((card) => <KanbanCard key={card.id} card={card} />)
        )}
      </div>
    </div>
  );
}
