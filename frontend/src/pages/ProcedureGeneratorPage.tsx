import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProcedureGeneratorForm } from '../components/ProcedureGeneratorForm';
import { ProcedureResultPanel } from '../components/ProcedureResultPanel';
import { FeatureHighlightCard } from '../components/FeatureHighlightCard';
import { GenerationProgress } from '../components/GenerationProgress';
import { ProcedureResultSkeleton } from '../components/ProcedureResultSkeleton';
import { useProcedureGenerator } from '../hooks/useProcedureGenerator';
import { prepareDossierForProcedure, saveProcedureSession } from '../services/processService';
import './ProcedureGeneratorPage.css';

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Analysis',
    description: 'Reads your intent, municipality, and property type to tailor every procedure to your exact case.',
  },
  {
    icon: '⚖️',
    title: 'Legal Guidance',
    description: 'Maps each step to the Albanian institutions and legal basis that actually apply to your request.',
  },
  {
    icon: '🗺️',
    title: 'Property Workflow Automation',
    description: 'Builds the full step-by-step workflow automatically — no manual institutional lookup required.',
  },
  {
    icon: '💡',
    title: 'Smart Recommendations',
    description: 'Surfaces only the documents you must provide, capped and grouped for clarity.',
  },
];

export function ProcedureGeneratorPage() {
  const { result, loading, error, generate } = useProcedureGenerator();
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleUploadDocuments() {
    if (!result) return;

    setPreparing(true);
    setPrepareError(null);

    try {
      const dossierId = await prepareDossierForProcedure(result);
      saveProcedureSession({ dossierId, procedure: result });
      navigate(`/document-upload?dossierId=${dossierId}`);
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : 'Could not prepare the dossier for upload.');
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div className="procedure-generator-page">
      <Link to="/" className="procedure-generator-page__back">
        ← Back to workflow
      </Link>

      <section className="procedure-generator-page__hero">
        <span className="procedure-generator-page__hero-badge">✨ AI-Powered Property Assistant</span>
        <h1>Procedure Generator</h1>
        <p>
          Tell us your intent, municipality, and property type — the assistant analyzes Albanian property law and
          institutional workflows to generate a procedure tailored to your exact case, in seconds.
        </p>
      </section>

      <div className="procedure-generator-page__features">
        {FEATURES.map((feature, index) => (
          <FeatureHighlightCard key={feature.title} delay={index * 90} {...feature} />
        ))}
      </div>

      <ProcedureGeneratorForm onGenerate={generate} loading={loading} />

      {error && (
        <p className="procedure-generator-page__status procedure-generator-page__status--error">⚠ {error}</p>
      )}

      {loading && (
        <div className="procedure-generator-page__loading">
          <GenerationProgress />
          <ProcedureResultSkeleton />
        </div>
      )}

      {!loading && result && (
        <ProcedureResultPanel procedure={result} onUploadDocuments={handleUploadDocuments} uploadPending={preparing} />
      )}

      {prepareError && (
        <p className="procedure-generator-page__status procedure-generator-page__status--error">⚠ {prepareError}</p>
      )}
    </div>
  );
}
