import type { Dossier } from '../types/dossier';
import { PHASES } from '../data/phases';
import { KanbanColumn } from './KanbanColumn';
import './KanbanBoard.css';

interface KanbanBoardProps {
  dossiers: Dossier[];
}

export function KanbanBoard({ dossiers }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {PHASES.map((phase) => (
        <KanbanColumn
          key={phase.id}
          phase={phase.id}
          title={phase.label}
          dossiers={dossiers.filter((dossier) => dossier.phase === phase.id)}
        />
      ))}
    </div>
  );
}
