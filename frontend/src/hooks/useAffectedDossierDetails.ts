import { useEffect, useState } from 'react';
import { getDossierSnapshot } from '../services/dossierService';
import type { DossierRequiringReview } from '../services/legalImpactService';
import type { RiskLevel } from '../types/dossier';

export interface AffectedDossierRow {
  id: number;
  trackingCode: string;
  phase: string;
  riskLevel: RiskLevel;
  statusBadge: string;
}

interface UseAffectedDossierDetailsResult {
  rows: AffectedDossierRow[];
  loading: boolean;
}

// A dossier still missing one of the legal change's newly required
// documents needs the new requirement applied, not just a routine look —
// that takes priority over a generic "review" label, using data the system
// already tracks (Dossier.missingFields) rather than a new status concept.
function statusBadgeFor(missingFields: string[], addedRequiredDocuments: string[], riskLevel: RiskLevel): string {
  const normalizedMissing = missingFields.map((field) => field.toLowerCase());
  const needsNewDocuments = addedRequiredDocuments.some((document) =>
    normalizedMissing.includes(document.toLowerCase())
  );
  if (needsNewDocuments) return 'Legal Update Required';
  if (riskLevel === 'high') return 'High Risk';
  return 'Review Required';
}

export function useAffectedDossierDetails(
  dossiers: DossierRequiringReview[],
  addedRequiredDocuments: string[]
): UseAffectedDossierDetailsResult {
  const [rows, setRows] = useState<AffectedDossierRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dossiers.length === 0) {
      setRows([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all(
      dossiers.map(async (dossier) => {
        const snapshot = await getDossierSnapshot(String(dossier.id));
        return {
          id: dossier.id,
          trackingCode: dossier.trackingCode,
          phase: dossier.phase,
          riskLevel: snapshot.riskLevel,
          statusBadge: statusBadgeFor(snapshot.missingFields, addedRequiredDocuments, snapshot.riskLevel)
        };
      })
    )
      .then((results) => {
        if (isMounted) setRows(results);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dossiers, addedRequiredDocuments]);

  return { rows, loading };
}
