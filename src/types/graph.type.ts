import type { EventObject } from "cytoscape";

export interface NodePosition {
  x: number;
  y: number;
}
export interface MouseEventObject extends EventObject {
  cyPosition?: { x: number; y: number };
}

type GraphAction =
  | { type: 'traverse'; from: string; to: string }
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

export interface EulerResult {
  step: stepInfo[];
  eulerCycle: string[];
}