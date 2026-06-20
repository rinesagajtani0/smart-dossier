import { useState } from 'react';
import { useApplicationSubmission } from '../hooks/useApplicationSubmission';
import { SubmitApplicationDialog } from './SubmitApplicationDialog';
import './CitizenApplicationSubmission.css';

interface CitizenApplicationSubmissionProps {
  dossierId: string;
  uploadedDocuments: string[];
  /** True once every document the citizen needs to provide has been uploaded. */
  readyToSubmit: boolean;
}

export function CitizenApplicationSubmission({
  dossierId,
  uploadedDocuments,
  readyToSubmit,
}: CitizenApplicationSubmissionProps) {
  const { submitted, submit } = useApplicationSubmission(dossierId);
  const [showConfirm, setShowConfirm] = useState(false);

  if (submitted) {
    return (
      <div className="citizen-application-submission citizen-application-submission--submitted">
        <h2 className="citizen-application-submission__title">Submitted - Awaiting Staff Review</h2>
        <p>
          Your application has been sent to the staff review queue. You don't need to do anything else right now —
          staff will review your documents and contact you if anything else is required.
        </p>
      </div>
    );
  }

  return (
    <div className="citizen-application-submission">
      <h2 className="citizen-application-submission__title">Review Your Upload</h2>
      <p>Check that everything below was uploaded correctly before submitting your application to staff.</p>

      <ul className="citizen-application-submission__documents">
        {uploadedDocuments.map((document) => (
          <li key={document}>{document}</li>
        ))}
      </ul>

      {readyToSubmit ? (
        <button
          type="button"
          className="citizen-application-submission__submit-button"
          onClick={() => setShowConfirm(true)}
        >
          Submit Application
        </button>
      ) : (
        <p className="citizen-application-submission__hint">Upload all required documents to continue.</p>
      )}

      {showConfirm && (
        <SubmitApplicationDialog
          uploadedDocuments={uploadedDocuments}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            submit();
            setShowConfirm(false);
          }}
        />
      )}
    </div>
  );
}
