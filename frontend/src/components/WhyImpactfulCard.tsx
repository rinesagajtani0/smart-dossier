import { useLegalChangeDetails } from '../hooks/useLegalChangeDetails';
import type { LegalImpactGraphResult } from '../services/legalImpactService';
import './WhyImpactfulCard.css';

interface WhyImpactfulCardProps {
  impact: LegalImpactGraphResult;
}

export function WhyImpactfulCard({ impact }: WhyImpactfulCardProps) {
  const details = useLegalChangeDetails(impact.legalChangeId);

  if (!details) return null;

  const directPhases = details.affectedPhases;
  const downstreamPhases = impact.affectedNodes.filter((node) => !directPhases.includes(node));

  return (
    <div className="why-impactful-card">
      <h3>Why Is This Legal Change Impactful?</h3>

      <p>{details.description}</p>

      <p>
        It directly applies to <strong>{directPhases.join(', ')}</strong>.
        {downstreamPhases.length > 0 ? (
          <>
            {' '}
            Because those stages feed into later steps of the workflow, dossiers currently in{' '}
            <strong>{downstreamPhases.join(', ')}</strong> need review too, even though the change didn't name
            them directly.
          </>
        ) : (
          ' The impact does not carry forward to any later stage.'
        )}
      </p>

      {impact.addedRequiredDocuments.length > 0 && (
        <p>
          Dossiers in these phases must now provide:{' '}
          <strong>{impact.addedRequiredDocuments.join(', ')}</strong>.
        </p>
      )}
    </div>
  );
}
