import { Link } from 'react-router-dom';
import { WorkflowStepCard } from '../components/WorkflowStepCard';
import { WORKFLOW_STEPS } from '../data/workflowSteps';
import {
  DEMO_DELAY_PREDICTION,
  DEMO_EXTRACTED_FIELDS,
  DEMO_LETTER_PREVIEW,
  DEMO_PROCEDURE_PHASES,
  DEMO_SIMILAR_CASES,
  DEMO_UPLOADED_FILES,
} from '../data/albaniaDemoData';
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
            {DEMO_PROCEDURE_PHASES.map((phase) => (
              <li key={phase}>{phase}</li>
            ))}
          </ol>
          <Link to="/procedure-generator" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...documentUpload}>
          <div className="workflow-preview__files">
            {DEMO_UPLOADED_FILES.map((file) => (
              <span key={file.fileName} className="workflow-preview__file">
                {file.fileName}
                <em>{file.status}</em>
              </span>
            ))}
          </div>
          <Link to="/document-upload" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...nlpExtraction}>
          <dl className="workflow-preview__kv">
            <div>
              <dt>Applicant</dt>
              <dd>{DEMO_EXTRACTED_FIELDS.applicant}</dd>
            </div>
            <div>
              <dt>Property Number</dt>
              <dd>{DEMO_EXTRACTED_FIELDS.propertyNumber}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{DEMO_EXTRACTED_FIELDS.confidence}</dd>
            </div>
          </dl>
          <Link to="/nlp-extraction" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...caseMemory}>
          <div className="workflow-preview__matches">
            {DEMO_SIMILAR_CASES.map((item) => (
              <span key={item.caseId} className="workflow-preview__match">
                <span>
                  {item.caseId} <strong>{item.matchPercent}% match</strong>
                </span>
                <small>
                  {item.outcome}
                  {item.reason ? ` — ${item.reason}` : ''}
                </small>
              </span>
            ))}
          </div>
          <Link to="/case-memory" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...delayPrediction}>
          <dl className="workflow-preview__kv">
            <div>
              <dt>Risk</dt>
              <dd>{DEMO_DELAY_PREDICTION.risk}</dd>
            </div>
            <div>
              <dt>Predicted delay</dt>
              <dd>{DEMO_DELAY_PREDICTION.predictedDelay}</dd>
            </div>
            <div>
              <dt>Likely blockage</dt>
              <dd>{DEMO_DELAY_PREDICTION.likelyBlockage}</dd>
            </div>
          </dl>
          <Link to="/delay-prediction" className="workflow-preview__try-it">
            Try it →
          </Link>
        </WorkflowStepCard>

        <WorkflowStepCard {...preventDelay}>
          <p className="workflow-preview__letter">{DEMO_LETTER_PREVIEW}</p>
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
