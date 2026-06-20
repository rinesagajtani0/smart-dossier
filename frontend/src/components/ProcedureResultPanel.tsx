import { useState } from 'react';
import type { GeneratedProcedure } from '../services/processService';
import { INTENT_MAPPINGS } from '../services/processService';
import { ProcedureResultList, ProcedureResultSection } from './ProcedureResultSection';
import { ProcessStepCard } from './ProcessStepCard';
import './ProcedureResultPanel.css';

interface ProcedureResultPanelProps {
  procedure: GeneratedProcedure;
  onUploadDocuments: () => void;
  uploadPending?: boolean;
}

const DIFFICULTY_LABEL: Record<GeneratedProcedure['complexity'], string> = {
  simple: 'Simple',
  medium: 'Medium',
  complex: 'Complex',
};

function buildSummaryText(procedure: GeneratedProcedure): string {
  return [
    `Procedure: ${procedure.procedureName}`,
    `Estimated Timeline: ${procedure.expectedTimeline}`,
    `Difficulty: ${DIFFICULTY_LABEL[procedure.complexity]}`,
    `Institutions Involved: ${procedure.institutions.join(', ')}`,
    `Required Documents: ${procedure.requiredDocuments.join(', ')}`,
    '',
    'Step-by-Step Process:',
    ...procedure.steps.map((step, index) => `  ${index + 1}. ${step.phase} — ${step.institution} (~${step.expectedDays} days)`),
  ].join('\n');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'procedure';
}

export function ProcedureResultPanel({ procedure, onUploadDocuments, uploadPending = false }: ProcedureResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const intentLabel =
    INTENT_MAPPINGS.find((mapping) => mapping.processType === procedure.processType)?.label ?? procedure.processType;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummaryText(procedure));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied by the browser — silently no-op,
      // the export button below is the fallback path.
    }
  }

  function handleExport() {
    const blob = new Blob([buildSummaryText(procedure)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `procedure-${slugify(procedure.propertyType)}-${slugify(procedure.municipality)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="procedure-result-panel">
      <div className="procedure-result-panel__toolbar">
        <div className="procedure-result-panel__badges">
          <span className="procedure-result-panel__badge procedure-result-panel__badge--status">✓ Generated</span>
          <span className={`procedure-result-panel__badge procedure-result-panel__badge--${procedure.complexity}`}>
            {DIFFICULTY_LABEL[procedure.complexity]}
          </span>
        </div>

        <div className="procedure-result-panel__actions">
          <button type="button" className="procedure-result-panel__action-button" onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button type="button" className="procedure-result-panel__action-button" onClick={handleExport}>
            ⬇ Export
          </button>
        </div>
      </div>

      <ProcedureResultSection label="Procedure Overview" icon="📋">
        <p className="procedure-result-panel__name">{procedure.procedureName}</p>
        <div className="procedure-result-panel__chips">
          <span className="procedure-result-panel__chip">🎯 {intentLabel}</span>
          {procedure.propertyType && <span className="procedure-result-panel__chip">🏠 {procedure.propertyType}</span>}
          {procedure.municipality && <span className="procedure-result-panel__chip">📍 {procedure.municipality}</span>}
        </div>
      </ProcedureResultSection>

      <div className="procedure-result-panel__split">
        <ProcedureResultSection label="Required Documents" icon="📄">
          <ProcedureResultList items={procedure.requiredDocuments} />
        </ProcedureResultSection>

        <ProcedureResultSection label="Institutions Involved" icon="🏛️">
          <ProcedureResultList items={procedure.institutions} />
        </ProcedureResultSection>
      </div>

      <ProcedureResultSection label="Estimated Timeline" icon="🕐">
        <p className="procedure-result-panel__timeline">{procedure.expectedTimeline}</p>
      </ProcedureResultSection>

      <ProcedureResultSection label="Step-by-Step Process" icon="🗺️" collapsible defaultOpen>
        <div className="procedure-result-panel__steps">
          {procedure.steps.map((step) => (
            <ProcessStepCard key={step.id} step={step} />
          ))}
        </div>
      </ProcedureResultSection>

      <ProcedureResultSection label="Important Notes" icon="💡" collapsible defaultOpen={false}>
        <ul className="procedure-result-panel__notes">
          <li>This procedure is classified as <strong>{DIFFICULTY_LABEL[procedure.complexity].toLowerCase()}</strong> complexity based on the selected property type.</li>
          <li>Estimated timelines depend on municipality caseload and may vary if documents are incomplete.</li>
          <li>Required documents must be originals or certified copies unless an institution states otherwise.</li>
        </ul>
      </ProcedureResultSection>

      <div className="procedure-result-panel__cta">
        <button
          type="button"
          className="procedure-result-panel__upload-button"
          onClick={onUploadDocuments}
          disabled={uploadPending}
        >
          {uploadPending ? 'Preparing dossier…' : 'Upload Required Documents'}
        </button>
      </div>
    </div>
  );
}
