import { useCallback, useState } from 'react';
import { generateProcedure } from '../services/processService';
import type { GeneratedProcedure, ProcedureGeneratorInput } from '../services/processService';

interface UseProcedureGeneratorResult {
  result: GeneratedProcedure | null;
  loading: boolean;
  error: string | null;
  generate: (input: ProcedureGeneratorInput) => void;
}

export function useProcedureGenerator(): UseProcedureGeneratorResult {
  const [result, setResult] = useState<GeneratedProcedure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback((input: ProcedureGeneratorInput) => {
    setLoading(true);
    setError(null);

    generateProcedure(input)
      .then((procedure) => setResult(procedure))
      .catch((err) => {
        setResult(null);
        setError(err instanceof Error ? err.message : 'Could not generate the procedure.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { result, loading, error, generate };
}
