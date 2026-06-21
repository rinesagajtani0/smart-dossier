import type { CSSProperties } from 'react';
import { PHASES } from '../data/phases';
import type { Phase } from '../types/dossier';
import './DelayPredictionTimeline.css';

interface DelayPredictionTimelineProps {
  likelyBlockage: string;
}

// `likelyBlockage` is whatever raw phase string the backend's heuristic
// picked (could be one of the canonical Phase values, or an older
// Albanian-named seed phase like "Verifikim Kadastral"). Only highlight a
// timeline node when there's real confidence in the match — defaulting to
// "Intake" on a miss would point at the wrong step, which is worse than not
// highlighting anything. The raw text is always shown verbatim regardless.
function matchBottleneckPhase(likelyBlockage: string): Phase | null {
  const value = likelyBlockage.toLowerCase();
  const exact = PHASES.find((phase) => phase.id.toLowerCase() === value);
  if (exact) return exact.id;
  if (/k[eë]rkes[eë]|intake/.test(value)) return 'Intake';
  if (/kadastral|ashk/.test(value)) return 'ASHK Check';
  if (/vler[eë]sim|valuation/.test(value)) return 'Property Valuation';
  if (/ligjor|legal/.test(value)) return 'Legal Review';
  if (/miratim|regjistrim|approval|final/.test(value)) return 'Final Approval';
  return null;
}

export function DelayPredictionTimeline({ likelyBlockage }: DelayPredictionTimelineProps) {
  const bottleneckPhase = matchBottleneckPhase(likelyBlockage);

  return (
    <div className="delay-prediction-timeline">
      <ol className="delay-prediction-timeline__track">
        {PHASES.map((phase, index) => {
          const isBottleneck = phase.id === bottleneckPhase;
          return (
            <li
              key={phase.id}
              className={[
                'delay-prediction-timeline__step',
                isBottleneck && 'delay-prediction-timeline__step--bottleneck',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--step-delay': `${index * 90}ms` } as CSSProperties}
            >
              <span className="delay-prediction-timeline__marker" aria-hidden="true">
                {isBottleneck ? '⚠' : index + 1}
              </span>
              <span className="delay-prediction-timeline__label">{phase.label}</span>
            </li>
          );
        })}
      </ol>

      <p className="delay-prediction-timeline__callout">
        <span aria-hidden="true">⚠</span> Predicted bottleneck: <strong>{likelyBlockage}</strong>
      </p>
    </div>
  );
}
