import type { ReactNode } from 'react';
import './WorkflowStepCard.css';

interface WorkflowStepCardProps {
  number: number;
  title: string;
  description: string;
  accent: string;
  children: ReactNode;
}

export function WorkflowStepCard({ number, title, description, accent, children }: WorkflowStepCardProps) {
  return (
    <article className="workflow-step-card" style={{ '--step-accent': accent } as React.CSSProperties}>
      <div className="workflow-step-card__header">
        <span className="workflow-step-card__number">{number}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="workflow-step-card__preview">{children}</div>
    </article>
  );
}
