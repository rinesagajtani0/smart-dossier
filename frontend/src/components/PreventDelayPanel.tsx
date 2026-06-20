import type { PreventDelayPlan } from '../hooks/usePreventDelay';
import { RiskTransition } from './RiskTransition';
import { ActionChecklist } from './ActionChecklist';
import { LetterPreview } from './LetterPreview';
import './PreventDelayPanel.css';

interface PreventDelayPanelProps {
  plan: PreventDelayPlan;
}

export function PreventDelayPanel({ plan }: PreventDelayPanelProps) {
  return (
    <div className="prevent-delay-panel">
      <div className="prevent-delay-panel__banner">
        <span className="prevent-delay-panel__banner-icon" aria-hidden="true">
          ✦
        </span>
        Delay prevented — here's the intervention plan
      </div>

      <section className="prevent-delay-panel__section">
        <h2>Updated Risk Status</h2>
        <RiskTransition currentRisk={plan.currentRisk} updatedRisk={plan.updatedRisk} />
      </section>

      <section className="prevent-delay-panel__section">
        <h2>Recommended Action Checklist</h2>
        <ActionChecklist items={plan.checklist} />
      </section>

      <section className="prevent-delay-panel__section">
        <h2>Generated Administrative Letter Preview</h2>
        <LetterPreview content={plan.letter.content} createdAt={plan.letter.createdAt} />
      </section>
    </div>
  );
}
