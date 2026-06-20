import './ActionChecklist.css';

interface ActionChecklistProps {
  items: string[];
}

export function ActionChecklist({ items }: ActionChecklistProps) {
  if (items.length === 0) {
    return <p className="action-checklist__empty">No follow-up actions required.</p>;
  }

  return (
    <ul className="action-checklist">
      {items.map((item, index) => (
        <li key={item} className="action-checklist__item" style={{ animationDelay: `${index * 80}ms` }}>
          <span className="action-checklist__check" aria-hidden="true">
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
