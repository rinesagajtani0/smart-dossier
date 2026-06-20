import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import './ProcedureResultSection.css';

interface ProcedureResultSectionProps {
  label: string;
  children: ReactNode;
  icon?: string;
  badge?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function ProcedureResultSection({
  label,
  children,
  icon,
  badge,
  collapsible = false,
  defaultOpen = true,
}: ProcedureResultSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  function toggle() {
    if (collapsible) setOpen((value) => !value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  }

  return (
    <div className="procedure-result-section">
      <div
        className={`procedure-result-section__header${collapsible ? ' procedure-result-section__header--clickable' : ''}`}
        onClick={collapsible ? toggle : undefined}
        onKeyDown={collapsible ? handleKeyDown : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? open : undefined}
      >
        <h3>
          {icon && (
            <span className="procedure-result-section__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {label}
        </h3>

        <div className="procedure-result-section__header-end">
          {badge}
          {collapsible && (
            <span
              className={`procedure-result-section__chevron${open ? ' procedure-result-section__chevron--open' : ''}`}
              aria-hidden="true"
            >
              ▾
            </span>
          )}
        </div>
      </div>

      <div className={`procedure-result-section__collapse${open ? ' procedure-result-section__collapse--open' : ''}`}>
        <div className="procedure-result-section__content">{children}</div>
      </div>
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
