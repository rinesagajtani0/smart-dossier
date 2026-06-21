import { useEffect, useState } from 'react';
import './AiProcessingTimeline.css';

const STAGES = ['Upload', 'OCR Extraction', 'NLP Analysis', 'Validation', 'Dossier Integration'];
const STEP_DELAY_MS = 260;

// By the time this renders, the upload + extraction already finished on the
// backend — this is a transparency replay of what happened, not a live
// tracker. Each stage lights up in sequence and stays lit; it only ever
// counts up, so the effect schedules its own next tick instead of resetting
// anything (no "inactive" branch calling setState synchronously).
export function AiProcessingTimeline() {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (doneCount >= STAGES.length) return undefined;
    const timer = setTimeout(() => setDoneCount((count) => count + 1), STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [doneCount]);

  return (
    <ol className="ai-processing-timeline">
      {STAGES.map((stage, index) => {
        const done = index < doneCount;
        const active = index === doneCount;
        return (
          <li
            key={stage}
            className={[
              'ai-processing-timeline__step',
              done && 'ai-processing-timeline__step--done',
              active && 'ai-processing-timeline__step--active',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="ai-processing-timeline__marker" aria-hidden="true">
              {done ? '✓' : index + 1}
            </span>
            {stage}
          </li>
        );
      })}
    </ol>
  );
}
