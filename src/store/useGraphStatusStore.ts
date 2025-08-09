import { create } from "zustand"
import type { AlgorithmResult, stepInfo } from "../types/graph.type";


type State = {
  isReady: boolean,

  interconnects: string[][],
  nodeDegrees: { [key: string]: { in: number, out: number, total: number } },
  adjacencyMatrix: number[][],
  adjacencyList: { [key: string]: string[] },
  nodeLabels: string[],
  edgeCounter: number,
  nodeCounter: number,

  isEndAlgorithm: boolean,
  result: {
    eulerCycle: string[],
    stepInfo: stepInfo[],
    errMess: string,
    sugMess: string,
    isCycle: boolean,
  },
}

type Action = {
  updateResult: ({ eulerCycle, stepInfo, errMess, sugMess }: AlgorithmResult) => void,
  updateIsEndAlgorithm: (newValue: boolean) => void,
  updateInterConnect: (interconnects: string[][]) => void,
  updateNodeDegree: (sourceId: string, targetId: string, isDerectedGraph: boolean, isAdd?: boolean) => void,
  initDegreeForNode: (nodeId: string) => void,
  updateAnalysis: (
    adjacencyMatrix: number[][],
    adjacencyList: { [key: string]: string[] },
    nodeLabels: string[],
    nodeCounter: number
  ) => void,
  handleResetStatus: () => void,
  handleLoadStatusFormFile: (nodeCounter: number, edgeCounter: number) => void,
  handleInit: () => void,
}

export const useGraphStatusStore = create<State & Action>((set) => ({
  isReady: false,
  interconnects: [],
  nodeDegrees: {},
  adjacencyMatrix: [],
  adjacencyList: {},
  nodeLabels: [],
  edgeCounter: 1,
  nodeCounter: 1,
  isEndAlgorithm: false,
  result: {
    eulerCycle: [],
    stepInfo: [],
    errMess: "",
    sugMess: "",
    isCycle: true,
  },

  updateResult: (newResult: Partial<AlgorithmResult>) => {
    set((state) => ({
      result: {
        ...state.result,
        ...newResult,
      }
    }));
  },
  updateIsEndAlgorithm: (newValue) => {
    set({ isEndAlgorithm: newValue });
  },
  handleInit: () => {
    set({ isReady: true });
  },
  handleResetStatus: () => {
    set({ nodeCounter: 1, edgeCounter: 1, nodeDegrees: {} });
  },
  handleLoadStatusFormFile: (nodeCounter, edgeCounter) => {
    set({ nodeCounter: nodeCounter, edgeCounter: edgeCounter });
  },
  updateAnalysis: (adjacencyMatix, adjacencyList, nodeLabels, nodeCounter) => {
    set({
      adjacencyMatrix: adjacencyMatix,
      adjacencyList: adjacencyList,
      // nodeLabels: nodeLabels.sort()
      nodeLabels: nodeLabels,
      nodeCounter: nodeCounter
    })
  },
  initDegreeForNode: (nodeId) => {
    set(state => {
      const nodeDegrees = { ...state.nodeDegrees };
      nodeDegrees[nodeId] = { in: 0, out: 0, total: 0 };

      return { nodeDegrees: nodeDegrees };
    });
  },
  updateNodeDegree: (source, target, isDerectedGraph, isAdd = true) => {
    set(state => {
      const nodeDegrees = { ...state.nodeDegrees };
      let edgeCounter = state.edgeCounter;


      if (isAdd) {
        nodeDegrees[source] = { ...(nodeDegrees[source] || { in: 0, out: 0, total: 0 }) };

        nodeDegrees[target] = { ...(nodeDegrees[target] || { in: 0, out: 0, total: 0 }) };

        edgeCounter += 1;
        // if (isDerectedGraph) {
        //   nodeDegrees[source].out += 1;
        //   nodeDegrees[target].in += 1;
        // }

        nodeDegrees[source].out += 1;
        nodeDegrees[target].in += 1;

        nodeDegrees[source].total += 1;
        nodeDegrees[target].total += 1;
      } else {
        edgeCounter -= 1;
        // if (isDerectedGraph) {
        if (Object.prototype.hasOwnProperty.call(nodeDegrees, source))
          nodeDegrees[source].out -= 1;
        if (Object.prototype.hasOwnProperty.call(nodeDegrees, target))
          nodeDegrees[target].in -= 1;
        // }
        if (Object.prototype.hasOwnProperty.call(nodeDegrees, source))
          nodeDegrees[source].total -= 1;
        if (Object.prototype.hasOwnProperty.call(nodeDegrees, target))
          nodeDegrees[target].total -= 1;
      }

      return { nodeDegrees: nodeDegrees, edgeCounter: edgeCounter };
    });
  },

  updateInterConnect: (interconnects) => {
    set({ interconnects: interconnects })
  }
}))