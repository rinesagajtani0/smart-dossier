import { Link } from 'react-router-dom';
import { ProcedureGeneratorForm } from '../components/ProcedureGeneratorForm';
import { ProcedureResultPanel } from '../components/ProcedureResultPanel';
import { useProcedureGenerator } from '../hooks/useProcedureGenerator';
import './ProcedureGeneratorPage.css';

export function ProcedureGeneratorPage() {
  const { result, loading, error, generate } = useProcedureGenerator();

  return (
    <div className="procedure-generator-page">
      <Link to="/" className="procedure-generator-page__back">
        ← Back to workflow
      </Link>

      <header className="procedure-generator-page__header">
        <h1>Procedure Generator</h1>
        <p>Describe what you're trying to do and generate the procedure that applies to it.</p>
      </header>

      <ProcedureGeneratorForm onGenerate={generate} loading={loading} />

      {error && <p className="procedure-generator-page__status procedure-generator-page__status--error">{error}</p>}

      {result && <ProcedureResultPanel procedure={result} />}
    </div>
  );
}
