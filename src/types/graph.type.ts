/* eslint-disable @typescript-eslint/no-unused-vars */
import type { EdgeSingular } from "cytoscape";

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

// AlgorithmPage
export interface GraphAnalysis {
  adjacencyMatrix: number[][]
  adjacencyList: { [key: string]: string[] }
  nodeDegrees: { [key: string]: { in: number; out: number; total: number } }
  nodeLabels: string[]
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