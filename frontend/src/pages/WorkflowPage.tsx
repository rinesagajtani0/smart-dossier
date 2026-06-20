import { Link } from 'react-router-dom';
import { WorkflowStepCard } from '../components/WorkflowStepCard';
import { WORKFLOW_STEPS } from '../data/workflowSteps';
import './WorkflowPage.css';

export function WorkflowPage() {
  const [procedureGenerator, documentUpload, nlpExtraction, caseMemory, delayPrediction, preventDelay] =
    WORKFLOW_STEPS;

  return (
    <div className="workflow-page">
      <header className="workflow-page__hero">
        <h1>Smart Dossier AI</h1>
        <p>An intelligent operations platform that takes a property dossier from intake to decision.</p>
      </header>

      <div className="workflow-page__grid">
        <WorkflowStepCard {...procedureGenerator}>
          <ol className="workflow-preview__chip-list">
            <li>Intake</li>
            <li>ASHK Check</li>
            <li>Property Valuation</li>
            <li>Legal Review</li>
            <li>Final Approval</li>
          </ol>
          <Link to="/procedure-generator" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...documentUpload}>
          <div className="workflow-preview__files">
            <span className="workflow-preview__file">
              ownership-certificate.pdf
              <em>Uploaded</em>
            </span>
            <span className="workflow-preview__file">
              valuation-report.pdf
              <em>Uploaded</em>
            </span>
          </div>
          <Link to="/document-upload" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...nlpExtraction}>
          <dl className="workflow-preview__kv">
            <div>
              <dt>Applicant</dt>
              <dd>Arta Gashi</dd>
            </div>
            <div>
              <dt>Property Number</dt>
              <dd>P-102/44</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>92%</dd>
            </div>
          </dl>
          <Link to="/document-upload" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...caseMemory}>
          <div className="workflow-preview__matches">
            <span className="workflow-preview__match">
              EXP-013 <strong>87% match</strong>
            </span>
            <span className="workflow-preview__match">
              EXP-007 <strong>74% match</strong>
            </span>
          </div>
          <Link to="/case-memory" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...delayPrediction}>
          <dl className="workflow-preview__kv">
            <div>
              <dt>Risk</dt>
              <dd>High</dd>
            </div>
            <div>
              <dt>Predicted delay</dt>
              <dd>8–15 days</dd>
            </div>
            <div>
              <dt>Likely blockage</dt>
              <dd>Property Valuation</dd>
            </div>
          </dl>
        </WorkflowStepCard>

        <WorkflowStepCard {...preventDelay}>
          <p className="workflow-preview__letter">
            "...the dossier requires the following item(s): valuation report. Please submit the requested
            documentation as soon as possible..."
          </p>
        </WorkflowStepCard>
      </div>

      <footer className="workflow-page__cta">
        <Link to="/dashboard" className="workflow-page__cta-button">
          Go to Operations Dashboard
        </Link>
        <Link to="/roles" className="workflow-page__cta-button workflow-page__cta-button--secondary">
          View Role Demos
        </Link>
      </footer>
    </div>
  );
}
