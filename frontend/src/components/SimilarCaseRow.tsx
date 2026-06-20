import type { SimilarCase } from '../services/dossierService';
import './SimilarCaseRow.css';

interface SimilarCaseRowProps {
  item: SimilarCase;
}

const OUTCOME_LABELS: Record<string, string> = {
  delayed: 'Delayed',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function SimilarCaseRow({ item }: SimilarCaseRowProps) {
  const outcomeKey = item.outcome?.toLowerCase() ?? 'unknown';
  const outcomeLabel = item.outcome ? OUTCOME_LABELS[outcomeKey] ?? item.outcome : 'Unknown';

  return (
    <li className="similar-case-row">
      <div className="similar-case-row__top">
        <span className="similar-case-row__id">{item.caseId}</span>
        <span className="similar-case-row__score">{item.score}% match</span>
      </div>

      <div className="similar-case-row__bar-track">
        <div className="similar-case-row__bar-fill" style={{ width: `${item.score}%` }} />
      </div>

      <div className="similar-case-row__details">
        <span className={`similar-case-row__outcome similar-case-row__outcome--${outcomeKey}`}>
          Outcome: {outcomeLabel}
        </span>
        {item.delayReason && <span className="similar-case-row__reason">Reason: {item.delayReason}</span>}
      </div>
    </li>
  );
}
