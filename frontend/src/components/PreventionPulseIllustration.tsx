import type { CSSProperties } from 'react';
import './PreventionPulseIllustration.css';

const NODES = [
  { icon: '🤖', label: 'Monitoring' },
  { icon: '📋', label: 'Validation' },
  { icon: '⚙️', label: 'Optimization' },
  { icon: '🔔', label: 'Alerts' },
  { icon: '🔄', label: 'Automation' },
];

// Decorative hero illustration: five nodes on a connected "network", with a
// pulse that loops across the links — stands in for "AI monitoring /
// document validation / process optimization / real-time alerts /
// workflow automation" without a video or animation library.
export function PreventionPulseIllustration() {
  return (
    <div className="prevention-pulse-illustration" aria-hidden="true">
      <div className="prevention-pulse-illustration__network">
        <span className="prevention-pulse-illustration__line" />
        <span className="prevention-pulse-illustration__pulse" />
        {NODES.map((node, index) => (
          <div
            key={node.label}
            className="prevention-pulse-illustration__node"
            style={{ '--node-delay': `${index * 0.15}s` } as CSSProperties}
          >
            <span className="prevention-pulse-illustration__node-icon">{node.icon}</span>
            <span className="prevention-pulse-illustration__node-label">{node.label}</span>
          </div>
        ))}
      </div>
      <span className="prevention-pulse-illustration__ai-badge">
        <span className="prevention-pulse-illustration__ai-dot" /> Scanning for risk signals…
      </span>
    </div>
  );
}
