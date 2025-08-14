/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Core, EdgeSingular, EventObject, NodeSingular } from "cytoscape";

// HomePage
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


export interface EulerResult {
  hasEulerCycle: boolean
  hasEulerPath: boolean
  eulerPath: string[]
  startNode?: string
  endNode?: string
  reason: string
}

export interface AlgorithmStep {
  step: number
  action: string
  stack: string[]
  circuit: string[]
  currentNode: string
  nextNode?: string
  adjacencyList: { [key: string]: string[] }
  explanation: string
}


// AlgorithmPage
// checked
export interface GraphAnalysis {
  adjacencyMatrix: number[][]
  adjacencyList: { [key: string]: string[] }
  nodeDegrees: { [key: string]: { in: number; out: number; total: number } }
  nodeLabels: string[]
}

// checked
export interface GraphState {
  isDirectedGraph: boolean;
  currentLayout: string;
  selectedElements: string[];
  selectedNode: NodeSingular | null;
  selectedEdge: EdgeSingular | null;
  connectedComponents: string[][];
}

// checked
export interface NodePosition {
  x: number;
  y: number;
}

// checked
export interface GraphRefs {
  cyInstanceRef: React.RefObject<Core | null>;
  dragSourceNodeIdRef: React.RefObject<string | null>;
  tempTargetNodeIdRef: React.RefObject<string | null>;
  tempEdgeIdRef: React.RefObject<string | null>;
  nodeCounterRef: React.RefObject<number>;
  edgeCounterRef: React.RefObject<number>;
  startNodeRef: React.RefObject<EdgeSingular | null>;
  newNodePositionRef: React.RefObject<NodePosition | null>;
}

// checked
export interface MouseEventObject extends EventObject {
  cyPosition?: { x: number; y: number };
}

// New
// export interface stepInfo {
//   step: number;
//   description: string;
//   eulerCycle?: string[];
//   stack?: string[];
// }

// export interface AlgorithmDataRunning {
//   step: stepInfo[];
//   eulerCycle: string[];
// }

// export interface AlgorithmResult {
//   eulerCycle?: string[],
//   stepInfo?: stepInfo[],
//   errMess?: string,
//   sugMess?: string,
//   isCycle?: boolean,
// }

// test
type GraphAction =
  | { type: 'traverse'; from: string; to: string } // Thêm màu cho cạnh
  | { type: 'unhighlight'; from: string; to: string };
export interface stepInfo {
  step?: number;
  description?: string;
  eulerCycle?: string[];
  stack?: string[];

  action?: GraphAction
}

export interface AlgorithmDataRunning {
  step: stepInfo[];
  eulerCycle: string[];
}

export interface AlgorithmResult {
  eulerCycle?: string[],
  stepInfo?: stepInfo[],
  errMess?: string,
  sugMess?: string,
  isCycle?: boolean,
}
