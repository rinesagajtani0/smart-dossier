import type { LegalChangeImpact } from '../types/dossier';
import './DeadlineReviewNotice.css';

interface DeadlineReviewNoticeProps {
  legalChangeImpact: LegalChangeImpact | null;
}

export function DeadlineReviewNotice({ legalChangeImpact }: DeadlineReviewNoticeProps) {
  const needsReview = legalChangeImpact?.systemAdaptation.deadlineAction === 'recalculate-or-confirm-deadline';

  if (!needsReview) {
    return null;
  }

  return (
    <div className="deadline-review-notice" role="alert">
      <span className="deadline-review-notice__icon" aria-hidden="true">
        ⚖
      </span>
      <span className="deadline-review-notice__message">Deadline must be reviewed due to recent legal changes.</span>
    </div>
  );
}
