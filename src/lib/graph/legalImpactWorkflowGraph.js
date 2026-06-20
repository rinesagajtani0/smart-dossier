import { DirectedGraph } from "./directedGraph.js";

// The canonical property-procedure workflow, as a directed graph. A legal
// change always enters at one or more of these nodes (wherever its
// affectedPhases land) and propagates forward along the edges below —
// every node reachable downstream of the entry point is "affected".
export const WORKFLOW_NODES = [
  "Application Submitted",
  "Document Verification",
  "Cadastral Verification",
  "Property Valuation",
  "Legal Review",
  "Registration Approval",
  "Completed"
];

export const WORKFLOW_EDGES = [
  ["Application Submitted", "Document Verification"],
  ["Document Verification", "Cadastral Verification"],
  ["Cadastral Verification", "Property Valuation"],
  ["Property Valuation", "Legal Review"],
  ["Legal Review", "Registration Approval"],
  ["Registration Approval", "Completed"]
];

// "Completed" is reachable downstream of everything, but a dossier that has
// already finished the workflow doesn't need re-review when a new legal
// requirement appears — there's nothing left to act on. Excluded from the
// "affected" accounting for that reason (a business rule about what counts
// as actionable impact, not a hardcoded per-change exception).
export const TERMINAL_NODE = "Completed";

// Maps every phase name this system uses — across process types, and across
// the raw Albanian DB values and their normalized English UI labels — onto
// one of the seven canonical graph nodes above. A phase with no entry here
// genuinely doesn't correspond to a modeled stage of this workflow (e.g.
// expropriation-specific phases like "Owner Notification") and is simply
// not matched, rather than being forced onto the nearest node.
const PHASE_TO_GRAPH_NODE = new Map([
  ["Intake", "Application Submitted"],
  ["Kërkesë Filluese", "Application Submitted"],
  ["KÃ«rkesÃ« Filluese", "Application Submitted"],
  ["Public Interest Request", "Application Submitted"],
  ["Applicant Intake", "Application Submitted"],

  ["ASHK Check", "Cadastral Verification"],
  ["Verifikim Kadastral", "Cadastral Verification"],
  ["Cadastral Verification", "Cadastral Verification"],
  ["Property Verification", "Cadastral Verification"],

  ["Property Valuation", "Property Valuation"],
  ["Vlerësim i Pronës", "Property Valuation"],
  ["VlerÃ«sim i PronÃ«s", "Property Valuation"],
  ["Valuation and Compensation", "Property Valuation"],

  ["Legal Review", "Legal Review"],
  ["Rishikim Ligjor", "Legal Review"],
  ["Legal Decision", "Legal Review"],
  ["Contract Preparation", "Legal Review"],

  ["Final Approval", "Registration Approval"],
  ["Miratim dhe Regjistrim", "Registration Approval"],
  ["Execution and Archive", "Registration Approval"]
]);

/** @returns {import('./types.js').GraphNode | null} */
export function mapPhaseToGraphNode(phase) {
  return PHASE_TO_GRAPH_NODE.get(phase) ?? null;
}

/** @returns {DirectedGraph} a graph whose nodes are GraphNode strings */
export function buildWorkflowGraph() {
  const graph = new DirectedGraph();
  for (const node of WORKFLOW_NODES) graph.addNode(node);
  for (const [from, to] of WORKFLOW_EDGES) graph.addEdge(from, to);
  return graph;
}
