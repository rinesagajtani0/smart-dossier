import { ALBANIAN_LEGAL_BASIS } from "./albanianLegalBasis.js";
import {
  buildWorkflowGraph,
  mapPhaseToGraphNode,
  TERMINAL_NODE,
  WORKFLOW_NODES
} from "./graph/legalImpactWorkflowGraph.js";

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
    affectedProcessTypes: update.appliesToProcessTypes,
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
 * Graph-level engine for legal-impact analysis. The analysis is rooted at
 * a LegalChange, not a dossier: a change names the phases it affects, the
 * graph determines every downstream phase that inherits the impact, and
 * only then do dossiers enter the picture — as the set of records sitting
 * in an affected phase. Stays free of Prisma — dossier lookups are the
 * caller's job (see routes/graph.js); this class only ever takes plain
 * dossier-shaped objects that the caller already fetched.
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
   * The root lookup: resolves a legalChangeId to the LegalChange the rest
   * of the analysis starts from.
   * @param {string} legalChangeId
   * @returns {LegalChange | null}
   */
  getLegalChangeById(legalChangeId) {
    const update = ALBANIAN_LEGAL_BASIS.regulatoryUpdates.find((candidate) => candidate.id === legalChangeId);
    return update ? toLegalChange(update) : null;
  }

  /**
   * Which of the given dossiers sit in an affected node right now — i.e.
   * which dossiers require review. Takes plain dossier-shaped objects (the
   * caller fetches candidates, typically open dossiers whose processType is
   * in the LegalChange's affectedProcessTypes) and returns the subset whose
   * current phase maps onto an affected node, keeping this class itself
   * free of Prisma.
   * @param {Array<{ phase: string }>} dossiers
   * @param {GraphNode[]} affectedNodes
   * @returns {Array<{ phase: string }>}
   */
  filterDossiersRequiringReview(dossiers, affectedNodes) {
    if (affectedNodes.length === 0) return [];
    const affectedNodeSet = new Set(affectedNodes);
    return dossiers.filter((dossier) => affectedNodeSet.has(mapPhaseToGraphNode(dossier.phase)));
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
   * Evaluates the graph-level impact of one or more legal changes (the
   * usual case is a single change, looked up via getLegalChangeById).
   * Affected-dossier counting is layered on top by the caller, via
   * filterDossiersRequiringReview, once it has affectedNodes in hand.
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
