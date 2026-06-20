import { useEffect, useState } from 'react';
import './GenerationProgress.css';

const STAGES = [
  { icon: '🧠', label: 'Analyzing intent' },
  { icon: '⚖️', label: 'Matching legal requirements' },
  { icon: '🗺️', label: 'Building workflow' },
  { icon: '✨', label: 'Finalizing procedure' },
];

// Mounted only while generation is in progress (the parent conditionally
// renders this), so a fresh mount is all the "reset" this needs — no effect
// branch has to call setState for the inactive case.
export function GenerationProgress() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((index) => Math.min(index + 1, STAGES.length - 1));
    }, 220);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="generation-progress" role="status" aria-live="polite">
      <div className="generation-progress__track">
        <div className="generation-progress__fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <ul className="generation-progress__stages">
        {STAGES.map((stage, index) => {
          const done = index < stageIndex;
          const isActive = index === stageIndex;
          return (
            <li
              key={stage.label}
              className={[
                'generation-progress__stage',
                done && 'generation-progress__stage--done',
                isActive && 'generation-progress__stage--active',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="generation-progress__stage-icon" aria-hidden="true">
                {done ? '✓' : stage.icon}
              </span>
              {stage.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
