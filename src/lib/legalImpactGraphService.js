import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";
import {
  buildWorkflowGraph,
  mapPhaseToGraphNode,
  TERMINAL_NODE,
  WORKFLOW_NODES
} from "./graph/legalImpactWorkflowGraph.js";
import { normalizePhaseForUi } from "./phaseMap.js";

/** @typedef {import('./graph/types.js').LegalChange} LegalChange */
/** @typedef {import('./graph/types.js').GraphNode} GraphNode */
/** @typedef {import('./graph/types.js').GraphEdge} GraphEdge */
/** @typedef {import('./graph/types.js').LegalImpactResult} LegalImpactResult */

const ACTIONABLE_NODE_COUNT = WORKFLOW_NODES.filter((node) => node !== TERMINAL_NODE).length;

const SEVERITY_WEIGHT = { low: 10, medium: 25, high: 40 };
const SEVERITY_RANK = { low: 0, medium: 1, high: 2 };

function severityOfUpdate(update) {
  if (update.newRequiredDocuments.length >= 2 || update.changedFields.length >= 3) return "high";
  if (update.newRequiredDocuments.length >= 1) return "medium";
  return "low";
}

/**
 * Projects the existing regulatory-update records — already the system's
 * one source of truth for legal changes, see legalEngine.js — into the
 * LegalChange shape this engine works with, instead of maintaining a
 * second, divergent registry of the same facts.
 * @returns {LegalChange}
 */
function toLegalChange(update) {
  return {
    id: update.id,
    title: update.title,
    description: update.reason,
    effectiveDate: update.effectiveDate,
    affectedPhases: update.appliesToPhases,
    changedFields: update.changedFields,
    addedRequiredDocuments: update.newRequiredDocuments,
    severity: severityOfUpdate(update)
  };
}

function highestSeverity(changes) {
  return changes.reduce(
    (highest, change) => (SEVERITY_RANK[change.severity] > SEVERITY_RANK[highest] ? change.severity : highest),
    "low"
  );
}

function severityFromScore(score) {
  if (score >= 67) return "high";
  if (score >= 34) return "medium";
  return "low";
}

/**
 * Graph-level engine for legal-impact analysis: given LegalChanges, works
 * out which workflow nodes/transitions they affect and how severe that is.
 * Stays free of Prisma — dossier lookups and bulk dossier queries are the
 * caller's job (see routes/graph.js); this class only ever takes plain
 * dossier-shaped objects or phase strings that the caller already fetched.
 */
export class LegalImpactGraphService {
  constructor() {
    this.graph = buildWorkflowGraph();
  }

  /** @returns {LegalChange[]} every legal change known to the system */
  getAllLegalChanges() {
    return ALBANIAN_LEGAL_BASIS.regulatoryUpdates.map(toLegalChange);
  }

  /**
   * Legal changes that apply to this dossier's process type and current
   * phase. appliesToPhases is expressed in normalized English UI phase
   * names; dossier.phase is the raw DB value (often Albanian) — normalize
   * before comparing, same matching logic as legalEngine.js.
   * @param {{ processType: string, phase: string }} dossier
   * @returns {LegalChange[]}
   */
  getApplicableLegalChanges(dossier) {
    const phase = normalizePhaseForUi(dossier.phase);
    return ALBANIAN_LEGAL_BASIS.regulatoryUpdates
      .filter(
        (update) =>
          update.appliesToProcessTypes.includes(dossier.processType) &&
          (update.appliesToPhases.includes(phase) || update.appliesToPhases.includes(dossier.phase))
      )
      .map(toLegalChange);
  }

  /**
   * How many of the given dossier phases land in an affected node. Takes
   * plain phase strings — the caller fetches the candidate dossiers (e.g.
   * all open dossiers of the same process type) and passes their phases in,
   * keeping this class itself free of Prisma.
   * @param {string[]} dossierPhases
   * @param {GraphNode[]} affectedNodes
   * @returns {number}
   */
  countAffectedDossiers(dossierPhases, affectedNodes) {
    if (affectedNodes.length === 0) return 0;
    const affectedNodeSet = new Set(affectedNodes);
    return dossierPhases.filter((phase) => affectedNodeSet.has(mapPhaseToGraphNode(phase))).length;
  }

  /**
   * The graph traversal itself: maps the given affected phases onto
   * workflow-graph nodes (the entry points), then walks every node
   * reachable downstream of those entry points — i.e. every phase that
   * inherits the impact even though no legal change named it directly.
   * Nothing here is hardcoded per change — entry points come from data,
   * propagation comes from the graph's edges.
   * @param {string[]} affectedPhases
   * @returns {{ affectedNodes: GraphNode[], affectedTransitions: GraphEdge[] }}
   */
  getDownstreamImpact(affectedPhases) {
    const entryNodes = new Set();
    for (const phase of affectedPhases) {
      const node = mapPhaseToGraphNode(phase);
      if (node) entryNodes.add(node);
    }

    if (entryNodes.size === 0) {
      return { affectedNodes: [], affectedTransitions: [] };
    }

    const { nodes, edges } = this.graph.traverseDownstream(entryNodes);
    const affectedNodes = nodes.filter((node) => node !== TERMINAL_NODE);
    const affectedNodeSet = new Set(affectedNodes);
    const affectedTransitions = edges
      .filter(([from, to]) => affectedNodeSet.has(from) && affectedNodeSet.has(to))
      .map(([from, to]) => ({ from, to }));

    return { affectedNodes, affectedTransitions };
  }

  /**
   * Pools every affected phase named across a set of legal changes and
   * runs them through the same downstream traversal as getDownstreamImpact.
   * @param {LegalChange[]} legalChanges
   * @returns {{ affectedNodes: GraphNode[], affectedTransitions: GraphEdge[] }}
   */
  computeGraphImpact(legalChanges) {
    const affectedPhases = legalChanges.flatMap((change) => change.affectedPhases);
    return this.getDownstreamImpact(affectedPhases);
  }

  /**
   * Severity and how far the change propagates are the only two inputs
   * available at this stage (no dossier load to weigh in yet).
   * @param {{ severity: "low"|"medium"|"high", affectedNodes: GraphNode[] }} params
   * @returns {number} 0-100
   */
  computeImpactScore({ severity, affectedNodes }) {
    const severityComponent = SEVERITY_WEIGHT[severity] ?? 0;
    const propagationComponent = (affectedNodes.length / ACTIONABLE_NODE_COUNT) * 50;
    return Math.round(Math.min(100, severityComponent + propagationComponent));
  }

  /**
   * Evaluates the graph-level impact of a set of legal changes with no
   * dossier context — callers that need "which changes apply to dossier X"
   * resolve that first (a future integration step) and pass the result in.
   * @param {LegalChange[]} legalChanges
   * @returns {LegalImpactResult}
   */
  evaluateLegalChanges(legalChanges) {
    if (legalChanges.length === 0) {
      return {
        legalChangeApplies: false,
        affectedNodes: [],
        affectedTransitions: [],
        impactScore: 0,
        severity: "low",
        changedFields: [],
        addedRequiredDocuments: [],
        recommendedAction: "No legal change impact detected."
      };
    }

    const { affectedNodes, affectedTransitions } = this.computeGraphImpact(legalChanges);
    const severity = highestSeverity(legalChanges);
    const impactScore = this.computeImpactScore({ severity, affectedNodes });

    return {
      legalChangeApplies: true,
      affectedNodes,
      affectedTransitions,
      impactScore,
      severity: severityFromScore(impactScore),
      changedFields: [...new Set(legalChanges.flatMap((change) => change.changedFields))],
      addedRequiredDocuments: [...new Set(legalChanges.flatMap((change) => change.addedRequiredDocuments))],
      recommendedAction: affectedNodes.length
        ? `Review dossiers currently in ${affectedNodes[0]}.`
        : "Review affected dossiers against the latest legal requirements before advancing."
    };
  }
}

export const legalImpactGraphService = new LegalImpactGraphService();
