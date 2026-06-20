import type { PreventDelayPlan } from '../hooks/usePreventDelay';
import { ActionChecklist } from './ActionChecklist';
import { RiskTransition } from './RiskTransition';
import './CitizenPreventDelayPanel.css';

interface CitizenPreventDelayPanelProps {
  plan: PreventDelayPlan;
}

// "Notify applicant" is a staff-side action performed on the citizen's
// behalf, not something the citizen themselves needs to do.
const STAFF_ONLY_CHECKLIST_ITEMS = new Set(['Notify applicant']);

export function CitizenPreventDelayPanel({ plan }: CitizenPreventDelayPanelProps) {
  const checklist = plan.checklist.filter((item) => !STAFF_ONLY_CHECKLIST_ITEMS.has(item));

  return (
    <div className="citizen-prevent-delay-panel">
      <section className="citizen-prevent-delay-panel__section">
        <h2>Action Checklist</h2>
        <ActionChecklist items={checklist} />
      </section>

      <section className="citizen-prevent-delay-panel__section">
        <h2>Missing Documents</h2>
        {plan.missingDocuments.length === 0 ? (
          <p className="citizen-prevent-delay-panel__empty">No documents are missing.</p>
        ) : (
          <ul className="citizen-prevent-delay-panel__list">
            {plan.missingDocuments.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="citizen-prevent-delay-panel__section">
        <h2>Required Next Steps</h2>
        {plan.nextSteps.length === 0 ? (
          <p className="citizen-prevent-delay-panel__empty">No further steps required right now.</p>
        ) : (
          <ul className="citizen-prevent-delay-panel__list">
            {plan.nextSteps.map((step) => (
              <li key={step}>Confirm {step}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="citizen-prevent-delay-panel__section">
        <h2>Prevent Delay Guidance</h2>
        <RiskTransition currentRisk={plan.currentRisk} updatedRisk={plan.updatedRisk} />
        <p className="citizen-prevent-delay-panel__guidance">
          Submitting the missing documents and completing the steps above can lower your risk level and help your
          application move forward without further delay.
        </p>
      </section>
    </div>
  );
}
