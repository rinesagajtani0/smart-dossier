import type { ExtractedDocumentData } from '../services/nlpService';
import { ProcedureResultList, ProcedureResultSection } from './ProcedureResultSection';
import './ExtractionResultPanel.css';

interface ExtractionResultPanelProps {
  data: ExtractedDocumentData;
}

type ConfidenceTone = 'high' | 'medium' | 'low';

function confidenceTone(confidence: number): ConfidenceTone {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

export function ExtractionResultPanel({ data }: ExtractionResultPanelProps) {
  const percent = Math.round(data.confidence * 100);
  const tone = confidenceTone(data.confidence);

  return (
    <div className="extraction-panel">
      <div className="extraction-panel__badge">
        <span aria-hidden="true">✨</span>
        AI Extracted
      </div>

      <div className="extraction-panel__grid">
        <ProcedureResultSection label="Applicant Name">
          <p className="extraction-panel__value">{data.applicantName || '—'}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Owner Name">
          <p className="extraction-panel__value">{data.ownerName || '—'}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Property Number">
          <p className="extraction-panel__value">{data.propertyNumber || '—'}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Cadastral Zone">
          <p className="extraction-panel__value">{data.cadastralZone || '—'}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Property Location">
          <p className="extraction-panel__value">{data.propertyLocation || '—'}</p>
        </ProcedureResultSection>

        <ProcedureResultSection label="Document Type">
          <p className="extraction-panel__value">{data.documentType || '—'}</p>
        </ProcedureResultSection>
      </div>

      <ProcedureResultSection label="Missing Fields">
        <ProcedureResultList
          items={data.missingFields}
          emptyLabel="No missing fields — document looks complete."
        />
      </ProcedureResultSection>

      <ProcedureResultSection label="Confidence Score">
        <div className="extraction-panel__confidence">
          <div className="extraction-panel__confidence-track">
            <div
              className={`extraction-panel__confidence-fill extraction-panel__confidence-fill--${tone}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`extraction-panel__confidence-value extraction-panel__confidence-value--${tone}`}>
            {percent}%
          </span>
        </div>
      </ProcedureResultSection>
    </div>
  );
}
