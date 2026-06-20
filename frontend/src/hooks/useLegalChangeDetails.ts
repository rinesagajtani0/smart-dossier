import { useEffect, useState } from 'react';
import { getLegalChanges } from '../services/legalImpactService';
import type { LegalChangeSummary } from '../services/legalImpactService';

export function useLegalChangeDetails(legalChangeId: string): LegalChangeSummary | null {
  const [details, setDetails] = useState<LegalChangeSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    getLegalChanges()
      .then((changes) => {
        if (isMounted) setDetails(changes.find((change) => change.id === legalChangeId) ?? null);
      })
      .catch(() => {
        if (isMounted) setDetails(null);
      });

    return () => {
      isMounted = false;
    };
  }, [legalChangeId]);

  return details;
}
