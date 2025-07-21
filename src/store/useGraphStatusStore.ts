import { create } from "zustand"


type State = {
  isReady: boolean,

  interconnects: string[][],
  nodeDegrees: { [key: string]: { in: number, out: number, total: number } },
  adjacencyMatrix: number[][],
  adjacencyList: { [key: string]: string[] },
  nodeLabels: string[],
  edgeCounter: number,
  nodeCounter: number,
}

type Action = {
  updateInterConnect: (interconnects: string[][]) => void,
  updateNodeDegree: (sourceId: string, targetId: string, isDerectedGraph: boolean, isAdd?: boolean) => void,
  initDegreeForNode: (nodeId: string) => void,
  updateAnalysis: (
    adjacencyMatrix: number[][],
    adjacencyList: { [key: string]: string[] },
    nodeLabels: string[]
  ) => void,
  handleResetStatus: () => void,
  handleLoadStatusFormFile: (nodeCounter: number, edgeCounter: number) => void,
  handleInit: () => void
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

  handleInit: () => {
    set({ isReady: true });
  },
  handleResetStatus: () => {
    set({ nodeCounter: 1, edgeCounter: 1 });
  },
  handleLoadStatusFormFile: (nodeCounter, edgeCounter) => {
    set({ nodeCounter: nodeCounter, edgeCounter: edgeCounter });
  },
  updateAnalysis: (adjacencyMatix, adjacencyList, nodeLabels) => {
    set({
      adjacencyMatrix: adjacencyMatix,
      adjacencyList: adjacencyList,
      nodeLabels: nodeLabels.sort()
    })
  },
  initDegreeForNode: (nodeId) => {
    set(state => {
      const nodeDegrees = { ...state.nodeDegrees };
      nodeDegrees[nodeId] = { in: 0, out: 0, total: 0 };

      return { nodeDegrees: nodeDegrees, nodeCounter: state.nodeCounter += 1 };
    });
  },
  updateNodeDegree: (sourceId, targetId, isDerectedGraph, isAdd = true) => {
    set(state => {
      const nodeDegrees = { ...state.nodeDegrees };
      let edgeCounter = state.edgeCounter;

      nodeDegrees[sourceId] = {
        ...(nodeDegrees[sourceId] || { in: 0, out: 0, total: 0 }),
      };

      nodeDegrees[targetId] = {
        ...(nodeDegrees[targetId] || { in: 0, out: 0, total: 0 }),
      };
      if (isAdd) {
        edgeCounter += 1;
        if (isDerectedGraph) {
          nodeDegrees[sourceId].out += 1;
          nodeDegrees[targetId].in += 1;
        }

        nodeDegrees[sourceId].total += 1;
        nodeDegrees[targetId].total += 1;
      } else {
        edgeCounter -= 1;
        if (isDerectedGraph) {
          nodeDegrees[sourceId].out -= 1;
          nodeDegrees[targetId].in -= 1;
        }

        nodeDegrees[sourceId].total -= 1;
        nodeDegrees[targetId].total -= 1;
      }
      return { nodeDegrees: nodeDegrees, edgeCounter: edgeCounter };
    });
  },

  updateInterConnect: (interconnects) => {
    set({ interconnects: interconnects })
  }
}))