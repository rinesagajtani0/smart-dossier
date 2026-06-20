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
        <p>An intelligent operations platform for property procedures across Albania — from intake to decision.</p>
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
              certifikate-pronesie.pdf
              <em>Uploaded</em>
            </span>
            <span className="workflow-preview__file">
              raport-vleresimi.pdf
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
              <dd>Elona Hoxha</dd>
            </div>
            <div>
              <dt>Property Number</dt>
              <dd>Nr. 145/22, ZK Tiranë</dd>
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
              <span>
                EXP-AL-044 <strong>86% match</strong>
              </span>
              <small>Delayed — Mungesë raporti vlerësimi</small>
            </span>
            <span className="workflow-preview__match">
              <span>
                EXP-AL-067 <strong>78% match</strong>
              </span>
              <small>Approved</small>
            </span>
            <span className="workflow-preview__match">
              <span>
                EXP-AL-081 <strong>71% match</strong>
              </span>
              <small>Rejected — Konflikt pronësie</small>
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
              <dd>8–14 days</dd>
            </div>
            <div>
              <dt>Likely blockage</dt>
              <dd>ASHK Check</dd>
            </div>
          </dl>
          <Link to="/delay-prediction" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...preventDelay}>
          <p className="workflow-preview__letter">
            "...the dossier requires the following item(s): certifikatë pronësie (ownership certificate). Please
            submit the requested documentation to ASHK as soon as possible..."
          </p>
          <Link to="/prevent-delay" className="workflow-preview__try-it">
            Try it →
          </Link>
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
