import type { KanbanColumns } from '../types/dossier';
import { PHASES } from '../data/phases';
import { KanbanColumn } from './KanbanColumn';
import './KanbanBoard.css';

interface KanbanBoardProps {
  columns: KanbanColumns;
}

export function KanbanBoard({ columns }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {PHASES.map((phase) => (
        <KanbanColumn key={phase.id} phase={phase.id} title={phase.label} cards={columns[phase.id] ?? []} />
      ))}
    </div>
  );
}
