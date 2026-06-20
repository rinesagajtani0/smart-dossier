import './LegalImpactPropagationPath.css';

// Mirrors the backend's canonical workflow graph (src/lib/graph/legalImpactWorkflowGraph.js),
// minus the terminal "Completed" node — this view only needs the actionable stages.
const WORKFLOW_NODES = [
  'Application Submitted',
  'Document Verification',
  'Cadastral Verification',
  'Property Valuation',
  'Legal Review',
  'Registration Approval',
];

interface LegalImpactPropagationPathProps {
  affectedNodes: string[];
}

export function LegalImpactPropagationPath({ affectedNodes }: LegalImpactPropagationPathProps) {
  const affected = new Set(affectedNodes);

  return (
    <div className="legal-impact-propagation-path">
      {WORKFLOW_NODES.map((node, index) => {
        const isAffected = affected.has(node);
        const nextNode = WORKFLOW_NODES[index + 1];
        const isTransitionAffected = isAffected && nextNode != null && affected.has(nextNode);

        return (
          <div className="legal-impact-propagation-path__step" key={node}>
            <div
              className={
                isAffected
                  ? 'legal-impact-propagation-path__node legal-impact-propagation-path__node--affected'
                  : 'legal-impact-propagation-path__node'
              }
            >
              {node}
            </div>
            {nextNode != null && (
              <span
                className={
                  isTransitionAffected
                    ? 'legal-impact-propagation-path__arrow legal-impact-propagation-path__arrow--affected'
                    : 'legal-impact-propagation-path__arrow'
                }
                aria-hidden="true"
              >
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
