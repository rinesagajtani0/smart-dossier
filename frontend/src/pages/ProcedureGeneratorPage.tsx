import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProcedureGeneratorForm } from '../components/ProcedureGeneratorForm';
import { ProcedureResultPanel } from '../components/ProcedureResultPanel';
import { useProcedureGenerator } from '../hooks/useProcedureGenerator';
import { prepareDossierForProcedure, saveProcedureSession } from '../services/processService';
import './ProcedureGeneratorPage.css';

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

      <header className="procedure-generator-page__header">
        <h1>Procedure Generator</h1>
        <p>Describe what you're trying to do and generate the property procedure that applies to it in Albania.</p>
      </header>

      <ProcedureGeneratorForm onGenerate={generate} loading={loading} />

      {error && <p className="procedure-generator-page__status procedure-generator-page__status--error">{error}</p>}

      {result && (
        <ProcedureResultPanel procedure={result} onUploadDocuments={handleUploadDocuments} uploadPending={preparing} />
      )}

      {prepareError && (
        <p className="procedure-generator-page__status procedure-generator-page__status--error">{prepareError}</p>
      )}
    </div>
  );
}
