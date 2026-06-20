// Minimal, reusable directed graph with breadth-first downstream traversal.
// No domain knowledge lives here — see legalImpactWorkflowGraph.js for the
// workflow-specific node/edge definitions built on top of this.
export class DirectedGraph {
  constructor() {
    this.adjacency = new Map();
  }

  addNode(node) {
    if (!this.adjacency.has(node)) this.adjacency.set(node, new Set());
    return this;
  }

  addEdge(from, to) {
    this.addNode(from);
    this.addNode(to);
    this.adjacency.get(from).add(to);
    return this;
  }

  hasNode(node) {
    return this.adjacency.has(node);
  }

  nodes() {
    return [...this.adjacency.keys()];
  }

  neighbors(node) {
    return [...(this.adjacency.get(node) ?? [])];
  }

  /**
   * Breadth-first traversal of every node reachable downstream from any of
   * `startNodes`. Returns the visited nodes in BFS order (including the
   * start nodes themselves) and every edge actually walked, as [from, to]
   * pairs — this is the only thing that determines "what's affected"; the
   * caller never hardcodes a node list per change.
   * @param {Iterable<import('./types.js').GraphNode>} startNodes
   * @returns {{ nodes: import('./types.js').GraphNode[], edges: [import('./types.js').GraphNode, import('./types.js').GraphNode][] }}
   */
  traverseDownstream(startNodes) {
    const visited = new Set();
    const order = [];
    const edges = [];
    const queue = [];

    for (const start of startNodes) {
      if (this.hasNode(start) && !visited.has(start)) {
        visited.add(start);
        order.push(start);
        queue.push(start);
      }
    }

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      for (const next of this.neighbors(current)) {
        edges.push([current, next]);
        if (!visited.has(next)) {
          visited.add(next);
          order.push(next);
          queue.push(next);
        }
      }
    }

    return { nodes: order, edges };
  }
}
