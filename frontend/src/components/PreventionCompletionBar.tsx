import type { CSSProperties } from 'react';
import './PreventionCompletionBar.css';

interface PreventionCompletionBarProps {
  completed: number;
  total: number;
}

export function PreventionCompletionBar({ completed, total }: PreventionCompletionBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="prevention-completion-bar">
      <div className="prevention-completion-bar__header">
        <span>Prevention Tasks Completed</span>
        <span className="prevention-completion-bar__count">
          {completed}/{total}
        </span>
      </div>
      <div className="prevention-completion-bar__track">
        <div
          className="prevention-completion-bar__fill"
          style={{ '--target-width': `${percent}%` } as CSSProperties}
        />
      </div>
      <span className="prevention-completion-bar__percent">{percent}% Complete</span>
    </div>
  );
}
