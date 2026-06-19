import type { Dossier, Phase } from '../types/dossier';
import { DossierCard } from './DossierCard';
import './KanbanColumn.css';

interface KanbanColumnProps {
  phase: Phase;
  title: string;
  dossiers: Dossier[];
}

export function KanbanColumn({ phase, title, dossiers }: KanbanColumnProps) {
  return (
    <div className={`kanban-column kanban-column--${phase}`}>
      <div className="kanban-column__header">
        <h3>{title}</h3>
        <span className="kanban-column__count">{dossiers.length}</span>
      </div>
      <div className="kanban-column__cards">
        {dossiers.length === 0 ? (
          <p className="kanban-column__empty">No dossiers</p>
        ) : (
          dossiers.map((dossier) => <DossierCard key={dossier.id} dossier={dossier} />)
        )}
      </div>
    </div>
  );
}
