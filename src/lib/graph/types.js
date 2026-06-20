// Shared JSDoc type definitions for the legal-impact graph foundation.
// Plain JSDoc typedefs (no TypeScript in this backend) — referenced from
// other modules via `@typedef {import('./types.js').X} X`.

/**
 * A node in the workflow graph, identified by its canonical phase label
 * (e.g. "Cadastral Verification"). Plain strings, not a class wrapper —
 * see legalImpactWorkflowGraph.js for the fixed set of valid values.
 * @typedef {string} GraphNode
 */

/**
 * A directed transition between two workflow graph nodes.
 * @typedef {Object} GraphEdge
 * @property {GraphNode} from
 * @property {GraphNode} to
 */

/**
 * A single legal/regulatory change, already normalized into the shape this
 * graph foundation works with. Built from ALBANIAN_LEGAL_BASIS.regulatoryUpdates
 * (see legalImpactGraphService.js's toLegalChange) — not a second registry.
 * @typedef {Object} LegalChange
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} effectiveDate - ISO date string
 * @property {string[]} affectedPhases - phase labels this change applies to;
 *   each is resolved to a GraphNode entry point via mapPhaseToGraphNode.
 * @property {string[]} changedFields
 * @property {string[]} addedRequiredDocuments
 * @property {"low"|"medium"|"high"} severity
 */

/**
 * The result of evaluating one or more LegalChanges against the workflow
 * graph, with no dossier context — purely "what does this change affect in
 * the abstract workflow." Dossier-specific fields (e.g. affected dossier
 * count) belong to a later integration layer, not this type.
 * @typedef {Object} LegalImpactResult
 * @property {boolean} legalChangeApplies
 * @property {GraphNode[]} affectedNodes
 * @property {GraphEdge[]} affectedTransitions
 * @property {number} impactScore - 0-100
 * @property {"low"|"medium"|"high"} severity
 * @property {string[]} changedFields
 * @property {string[]} addedRequiredDocuments
 * @property {string} recommendedAction
 */

export {};
