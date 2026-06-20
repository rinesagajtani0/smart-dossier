import './SubmitApplicationDialog.css';

interface SubmitApplicationDialogProps {
  uploadedDocuments: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitApplicationDialog({ uploadedDocuments, onConfirm, onCancel }: SubmitApplicationDialogProps) {
  return (
    <div className="submit-application-dialog__overlay">
      <div
        className="submit-application-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="submit-application-dialog-title"
        aria-describedby="submit-application-dialog-message"
      >
        <h2 id="submit-application-dialog-title" className="submit-application-dialog__title">
          Submit Application?
        </h2>
        <p id="submit-application-dialog-message" className="submit-application-dialog__message">
          You're about to submit your application for staff review. Once submitted, it will be sent to the staff
          review queue.
        </p>

        <ul className="submit-application-dialog__documents">
          {uploadedDocuments.map((document) => (
            <li key={document}>{document}</li>
          ))}
        </ul>

        <div className="submit-application-dialog__actions">
          <button type="button" className="submit-application-dialog__cancel" onClick={onCancel}>
            Review Again
          </button>
          <button type="button" className="submit-application-dialog__confirm" onClick={onConfirm}>
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}
