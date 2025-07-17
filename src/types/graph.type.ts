import type { EdgeSingular } from "cytoscape";

export interface Algorithm {
  running: boolean;
  stack: string[];
  circuit: string[];
  currentVertex: string | null;
  visitedEdges: Set<string>;
  adjacencyList: { [key: string]: EdgeSingular[] };
  step: number;
  finished: boolean;
}