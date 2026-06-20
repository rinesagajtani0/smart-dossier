import type { ReactNode } from 'react';
import './ProcedureResultSection.css';

interface ProcedureResultSectionProps {
  label: string;
  children: ReactNode;
}

export function ProcedureResultSection({ label, children }: ProcedureResultSectionProps) {
  return (
    <div className="procedure-result-section">
      <h3>{label}</h3>
      <div className="procedure-result-section__content">{children}</div>
    </div>
  );
}

interface ProcedureResultListProps {
  items: string[];
  emptyLabel?: string;
}

export function ProcedureResultList({ items, emptyLabel = 'None' }: ProcedureResultListProps) {
  if (items.length === 0) {
    return <p className="procedure-result-section__empty">{emptyLabel}</p>;
  }

  return (
    <ul className="procedure-result-section__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
