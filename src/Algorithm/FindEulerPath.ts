import type { Core } from "cytoscape";

interface stepInfo {
  step: number;
  description: string;
  eulerCycle?: string[];
  stack?: string[];
}

interface AlgorithmResult {
  step: stepInfo[];
  eulerCycle: string[];
}

const counNodeWithDFS = (u: string, adjArr: string[], visited: Map<string, boolean>): number => {
  visited.set(u, true);
  let count = 1;
  for (const item of adjArr) {
    if (!visited.get(u))
      count += counNodeWithDFS(item, adjArr, visited);
  }
  return count;
}

const isBridge = (u: string, v: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean) => {
  const visited = new Map<string, boolean>();
  for (const [key] of Object.entries(adjList)) {
    visited.set(key, false);
  }

  const count_before = counNodeWithDFS(u, adjList[u], visited);

  const adjList_clone = Object.fromEntries(
    Object.entries(adjList).map(([k, v]) => [k, [...v]])
  );

  let index = adjList_clone[u].indexOf(v);
  adjList_clone[u].splice(index, 1);
  if (!isDirectedGraph) {
    index = adjList_clone[v].indexOf(u);
    adjList_clone[v].splice(index, 1);
  }

  for (const [key] of Object.entries(adjList)) {
    visited.set(key, false);
  }
  const count_after = counNodeWithDFS(u, adjList_clone[u], visited);

  return count_before > count_after;
}

class AlgorithmEuler {
  static Hierholzer = (cyInstanceRef: React.RefObject<Core | null>, start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): AlgorithmResult => {
    const cy = cyInstanceRef.current;
    if (!cy) return {
      step: [],
      eulerCycle: [],
    };

    const steps: stepInfo[] = [];
    const stepsCounter = { count: 4 };

    const eulerCycle: string[] = [];
    const stack: string[] = [start];
    steps.push({
      step: stepsCounter.count++,
      description: `Khởi tạo thuật toán Hierholzer. Thêm đỉnh bắt đầu ${cy.$id(start).data("label")} vào stack`,
      eulerCycle: [],
      stack: [],
    });


    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      steps.push({
        step: stepsCounter.count++,
        description: `Lấy đỉnh đầu của stack. Xét đỉnh ${cy.$id(curr).data("label")}`,
        eulerCycle: [...eulerCycle],
        stack: [...stack],
      })

      if (adjList[curr].length > 0) {
        const next = adjList[curr].pop();
        if (!isDirectedGraph && next) {
          const index = adjList[next].indexOf(curr);
          adjList[next].splice(index, 1);
        }
        stack.push(next!);

        steps.push({
          step: stepsCounter.count++,
          description: `Duyệt cạnh kề của ${cy.$id(curr).data("label")}. Đi theo cạnh ('${cy.$id(curr).data("label")}' --> '${cy.$id(next!).data("label")}'), xóa cạnh này và thêm ${cy.$id(next!).data("label")} vào stack.`,
          eulerCycle: [...eulerCycle],
          stack: [...stack],
        })
      } else {
        eulerCycle.push(stack.pop()!)
        steps.push({
          step: stepsCounter.count++,
          description: `Đỉnh ${cy.$id(curr).data("label")} không còn cạnh kề, thêm ${cy.$id(curr).data("label")} vào Euler circle và quay lui.`,
          eulerCycle: [...eulerCycle],
          stack: [...stack],
        })
      }
    };

    return {
      step: steps,
      eulerCycle: eulerCycle.reverse(),
    };
  }

  static Flery = (start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): string[] => {
    const eulerCycle: string[] = [];
    const stack: string[] = [start];

    while (stack.length > 0) {
      const u = stack[stack.length - 1];

      if (adjList[u].length > 0) {
        let v = adjList[u][adjList[u].length - 1];
        console.log("Check v: ", v);
        for (const next of [...adjList[u]].reverse()) {
          if (!isBridge(u, next, adjList, isDirectedGraph)) {
            v = next;
            break;
          }
        }

        stack.push(v!);
        let index = adjList[u].indexOf(v);
        const next = adjList[u][index];
        console.log("Check next: ", next);
        adjList[u].splice(index, 1);
        if (!isDirectedGraph && next) {
          index = adjList[next].indexOf(u);
          adjList[next].splice(index, 1);
        }
      } else {
        eulerCycle.push(stack.pop()!)
      }
    }
    return eulerCycle.reverse();
  }
}

export default AlgorithmEuler;
export type { stepInfo, AlgorithmResult };