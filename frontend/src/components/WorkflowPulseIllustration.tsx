import type { CSSProperties } from 'react';
import './WorkflowPulseIllustration.css';

const NODES = ['📥', '🔍', '🏛️', '✅', '🏁'];

// Purely decorative hero illustration — a generic workflow track with a
// glowing dot that loops across it, standing in for "workflow progression /
// timeline movement / AI analysis" without needing a video or chart library.
export function WorkflowPulseIllustration() {
  return (
    <div className="workflow-pulse-illustration" aria-hidden="true">
      <div className="workflow-pulse-illustration__track">
        <span className="workflow-pulse-illustration__line" />
        <span className="workflow-pulse-illustration__pulse" />
        {NODES.map((icon, index) => (
          <span
            key={index}
            className="workflow-pulse-illustration__node"
            style={{ '--node-delay': `${index * 0.15}s` } as CSSProperties}
          >
            {icon}
          </span>
        ))}
      </div>
      <span className="workflow-pulse-illustration__ai-badge">
        <span className="workflow-pulse-illustration__ai-dot" /> AI analyzing workflow patterns…
      </span>
    </div>
  );
}
