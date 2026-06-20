import type { SimilarCase } from '../services/dossierService';
import { SimilarCaseRow } from './SimilarCaseRow';
import './SimilarCasesPanel.css';

interface SimilarCasesPanelProps {
  cases: SimilarCase[];
}

export function SimilarCasesPanel({ cases }: SimilarCasesPanelProps) {
  return (
    <div className="similar-cases-panel">
      <div className="similar-cases-panel__header">
        <h2>Similar Cases</h2>
        <span className="similar-cases-panel__badge">Case Memory</span>
      </div>

      {cases.length === 0 ? (
        <p className="similar-cases-panel__empty">No similar cases found for this dossier.</p>
      ) : (
        <ul className="similar-cases-panel__list">
          {cases.map((item) => (
            <SimilarCaseRow key={item.caseId} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
