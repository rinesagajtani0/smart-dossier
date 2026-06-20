import { useCallback, useState } from 'react';
import { generateProcedure } from '../services/processService';
import type { GeneratedProcedure, ProcedureGeneratorInput } from '../services/processService';

interface UseProcedureGeneratorResult {
  result: GeneratedProcedure | null;
  loading: boolean;
  error: string | null;
  generate: (input: ProcedureGeneratorInput) => void;
}

// generateProcedure resolves almost instantly (it's a deterministic, local
// computation, not a network call) — without a small floor here, the
// progress indicator and skeleton loader would flash and disappear before
// they're perceptible. This is purely about giving the generation step
// visible weight, not real work.
const MIN_LOADING_MS = 900;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useProcedureGenerator(): UseProcedureGeneratorResult {
  const [result, setResult] = useState<GeneratedProcedure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback((input: ProcedureGeneratorInput) => {
    setLoading(true);
    setError(null);

    Promise.all([generateProcedure(input), wait(MIN_LOADING_MS)])
      .then(([procedure]) => setResult(procedure))
      .catch((err) => {
        setResult(null);
        setError(err instanceof Error ? err.message : 'Could not generate the procedure.');
      })
      .finally(() => setLoading(false));
  }, []);

  return { result, loading, error, generate };
}
