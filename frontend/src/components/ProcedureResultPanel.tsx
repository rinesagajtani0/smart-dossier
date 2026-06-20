import type { GeneratedProcedure } from '../services/processService';
import { ProcedureResultList, ProcedureResultSection } from './ProcedureResultSection';
import { ProcessStepCard } from './ProcessStepCard';
import './ProcedureResultPanel.css';

interface ProcedureResultPanelProps {
  procedure: GeneratedProcedure;
}

export function ProcedureResultPanel({ procedure }: ProcedureResultPanelProps) {
  return (
    <div className="procedure-result-panel">
      <ProcedureResultSection label="Procedure Name">
        <p className="procedure-result-panel__name">{procedure.procedureName}</p>
      </ProcedureResultSection>

      <ProcedureResultSection label="Expected Timeline">
        <p className="procedure-result-panel__timeline">{procedure.expectedTimeline}</p>
      </ProcedureResultSection>

      <ProcedureResultSection label="Required Documents">
        <ProcedureResultList items={procedure.requiredDocuments} />
      </ProcedureResultSection>

      <ProcedureResultSection label="Institutions">
        <ProcedureResultList items={procedure.institutions} />
      </ProcedureResultSection>

      <ProcedureResultSection label="Relevant Rules">
        <ProcedureResultList items={procedure.relevantRules} emptyLabel="No special rules for this procedure." />
      </ProcedureResultSection>

      <ProcedureResultSection label="Risks">
        <ProcedureResultList items={procedure.risks} emptyLabel="No notable risks identified." />
      </ProcedureResultSection>

      <div className="procedure-result-panel__full">
        <ProcedureResultSection label="Process Workflow">
          <div className="procedure-result-panel__steps">
            {procedure.steps.map((step) => (
              <ProcessStepCard key={step.id} step={step} />
            ))}
          </div>
        </ProcedureResultSection>
      </div>
    </div>
  );
}
