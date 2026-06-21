import type { CSSProperties } from 'react';
import './PreventionTimeline.css';

const STAGES = [
  'Document Upload',
  'Validation',
  'AI Analysis',
  'Risk Detection',
  'Prevention Actions',
  'Successful Completion',
];

interface PreventionTimelineProps {
  /** Index into STAGES where the plan's current bottleneck sits, or null if there's nothing to flag. */
  highlightIndex: number | null;
}

export function PreventionTimeline({ highlightIndex }: PreventionTimelineProps) {
  return (
    <ol className="prevention-timeline">
      {STAGES.map((stage, index) => {
        const isBottleneck = index === highlightIndex;
        const isComplete = highlightIndex !== null && index < highlightIndex;
        return (
          <li
            key={stage}
            className={[
              'prevention-timeline__step',
              isBottleneck && 'prevention-timeline__step--bottleneck',
              isComplete && 'prevention-timeline__step--complete',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ '--step-delay': `${index * 80}ms` } as CSSProperties}
          >
            <span className="prevention-timeline__marker" aria-hidden="true">
              {isBottleneck ? '⚠' : isComplete ? '✓' : index + 1}
            </span>
            <span className="prevention-timeline__label">{stage}</span>
          </li>
        );
      })}
    </ol>
  );
}
