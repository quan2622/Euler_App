import type { Core } from "cytoscape";
import type { AlgorithmDataRunning, stepInfo } from "../types/graph.type";

const counNodeWithDFS = (start: string, adjList: { [key: string]: string[] }, visited: Map<string, boolean>): number => {
  visited.set(start, true);
  let count = 1;

  for (const neighbor of adjList[start] || []) {
    if (!visited.get(neighbor)) {
      count += counNodeWithDFS(neighbor, adjList, visited);
    }
  }
  return count;
}

const isBridge = (u: string, v: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): boolean => {
  if (adjList[u].length === 1) {
    return false;
  }

  const adjList_clone = Object.fromEntries(
    Object.entries(adjList).map(([k, v]) => [k, [...v]])
  );

  const visited_before = new Map<string, boolean>();
  Object.keys(adjList).forEach(key => visited_before.set(key, false));
  const count_before = counNodeWithDFS(u, adjList, visited_before);

  let index = adjList_clone[u].indexOf(v);
  adjList_clone[u].splice(index, 1);
  if (!isDirectedGraph) {
    index = adjList_clone[v].indexOf(u);
    adjList_clone[v].splice(index, 1);
  }

  const visited_after = new Map<string, boolean>();
  Object.keys(adjList_clone).forEach(key => visited_after.set(key, false));
  const count_after = counNodeWithDFS(u, adjList_clone, visited_after);

  return count_after < count_before;
}

class AlgorithmEuler {
  static Hierholzer = (cyInstanceRef: React.RefObject<Core | null>, start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): AlgorithmDataRunning => {
    const cy = cyInstanceRef.current;
    if (!cy) return {
      step: [],
      eulerCycle: [],
    };

    const steps: stepInfo[] = [];
    const stepsCounter = { count: 1 };
    const eulerCycle: string[] = [];
    const stack: string[] = [start];

    steps.push({
      step: stepsCounter.count++,
      description: `Khởi tạo thuật toán Hierholzer. Thêm đỉnh bắt đầu ${cy.$id(start).data("label")} vào stack`,
      eulerCycle: [],
      stack: [...stack],
    });


    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      steps.push({
        step: stepsCounter.count++,
        description: `Lấy đỉnh đầu của stack. Xét đỉnh ${cy.$id(curr).data("label")}`,
        eulerCycle: [...eulerCycle],
        stack: [...stack],
      });

      if (adjList[curr].length > 0) {
        const next = adjList[curr].shift();
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
          // ================== TEST ==================
          action: { type: 'traverse', from: curr, to: next! }
          // ===================================================
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

  // =============================================== FLEURY ===============================================
  static Fleury = (cyInstanceRef: React.RefObject<Core | null>, start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): AlgorithmDataRunning => {
    const cy = cyInstanceRef.current;
    if (!cy) return {
      step: [],
      eulerCycle: [],
    };

    const steps: stepInfo[] = [];
    const stepsCounter = { count: 1 };
    const eulerCycle: string[] = [];
    let curr = start;

    steps.push({
      step: stepsCounter.count++,
      description: `Bắt đầu thuật toán Fleury từ đỉnh ${cy.$id(start).data("label")}`,
      eulerCycle: [],
    });

    while (true) {
      eulerCycle.push(curr);
      steps.push({
        step: stepsCounter.count++,
        description: `Xét đỉnh ${cy.$id(curr).data("label")}. Kiểm tra đỉnh còn đỉnh kề không?`,
        eulerCycle: [...eulerCycle],
      });

      if (adjList[curr].length === 0) {
        steps.push({
          step: stepsCounter.count++,
          description: `Đỉnh ${cy.$id(curr).data("label")} không còn cạnh kề`,
          eulerCycle: [...eulerCycle],
        });
        break;
      }

      let next = null;
      for (const v of adjList[curr]) {
        steps.push({
          step: stepsCounter.count++,
          description: `Kiểm tra cạnh ('${cy.$id(curr).data("label")}' -> '${cy.$id(v).data("label")}')...`,
          eulerCycle: [...eulerCycle],
          action: { type: 'traverse', from: curr, to: v }
        });

        if (!isBridge(curr, v, adjList, isDirectedGraph)) {
          steps.push({
            step: stepsCounter.count++,
            description: `Chọn cạnh ('${cy.$id(curr).data("label")}' --> '${cy.$id(v).data("label")}'): Không phải cạnh cầu`,
            eulerCycle: [...eulerCycle],
          });
          next = v;
          break;
        } else {
          steps.push({
            step: stepsCounter.count++,
            description: `Cạnh này là cạnh cầu. Bỏ qua và xét cạnh khác.`,
            eulerCycle: [...eulerCycle],
            action: { type: 'unhighlight', from: curr, to: v }
          });
        }
      }

      if (!next) {
        next = adjList[curr][0];
        steps.push({
          step: stepsCounter.count++,
          description: `Không tìm thấy cạnh không phải cạnh cầu. Chọn cạnh cầu đầu tiên ('${cy.$id(curr).data("label")}' --> '${cy.$id(next).data("label")}')`,
          eulerCycle: [...eulerCycle],
          action: { type: 'traverse', from: curr, to: next }
        });
      }

      let index = adjList[curr].indexOf(next);
      adjList[curr].splice(index, 1);
      if (!isDirectedGraph) {
        index = adjList[next].indexOf(curr);
        adjList[next].splice(index, 1);
      }
      steps.push({
        step: stepsCounter.count++,
        description: `Xóa cạnh ('${cy.$id(curr).data("label")}' --> '${cy.$id(next).data("label")}')`,
        eulerCycle: [...eulerCycle],
      });
      curr = next;
    }

    return {
      step: steps,
      eulerCycle: eulerCycle,
    };
  }
}

export default AlgorithmEuler;