import { useState } from 'react';
import type { PreventDelayPlan } from '../hooks/usePreventDelay';
import { usePermissions } from '../auth/usePermissions';
import { RiskTransition } from './RiskTransition';
import { ActionChecklist } from './ActionChecklist';
import { LetterPreview } from './LetterPreview';
import './PreventDelayPanel.css';

interface PreventDelayPanelProps {
  plan: PreventDelayPlan;
}

// This panel only ever renders for staff or manager (citizens get
// CitizenPreventDelayPanel instead — see PreventDelayPage). Staff carries
// out the plan operationally; manager approves intervention and escalation.
export function PreventDelayPanel({ plan }: PreventDelayPanelProps) {
  const { can } = usePermissions();
  const isManager = can('view-manager-reports');
  const [primaryActionDone, setPrimaryActionDone] = useState(false);
  const [secondaryActionDone, setSecondaryActionDone] = useState(false);

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

      <section
        className={`prevent-delay-panel__section prevent-delay-panel__role-actions prevent-delay-panel__role-actions--${isManager ? 'manager' : 'staff'}`}
      >
        <h2>{isManager ? 'Manager Intervention' : 'Staff Action'}</h2>
        <div className="prevent-delay-panel__role-actions-buttons">
          {isManager ? (
            <>
              <button
                type="button"
                className="prevent-delay-panel__action-button prevent-delay-panel__action-button--primary"
                onClick={() => setPrimaryActionDone(true)}
                disabled={primaryActionDone}
              >
                {primaryActionDone ? 'Intervention Approved' : 'Approve Intervention Plan'}
              </button>
              <button
                type="button"
                className="prevent-delay-panel__action-button prevent-delay-panel__action-button--secondary"
                onClick={() => setSecondaryActionDone(true)}
                disabled={secondaryActionDone}
              >
                {secondaryActionDone ? 'Escalated to Legal Review' : 'Escalate to Legal Review'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="prevent-delay-panel__action-button prevent-delay-panel__action-button--primary"
                onClick={() => setPrimaryActionDone(true)}
                disabled={primaryActionDone}
              >
                {primaryActionDone ? 'Letter Sent to Applicant' : 'Send Letter to Applicant'}
              </button>
              <button
                type="button"
                className="prevent-delay-panel__action-button prevent-delay-panel__action-button--secondary"
                onClick={() => setSecondaryActionDone(true)}
                disabled={secondaryActionDone}
              >
                {secondaryActionDone ? 'Plan Marked Executed' : 'Mark Plan Executed'}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
