import type { Core } from "cytoscape";
import type { AlgorithmDataRunning, stepInfo } from "../types/graph.type";

const isBridge = (u: string, v: string, adjList: { [key: string]: string[] }, isDerectedGraph: boolean) => {

  const adjList_clone = Object.fromEntries(
    Object.entries(adjList).map(([k, v]) => [k, [...v]])
  );

  if (adjList_clone[u]) {
    adjList_clone[u] = adjList_clone[u].filter((neighbor: string) => neighbor !== v);
  }

  if (!isDerectedGraph) {
    if (adjList_clone[v]) {
      adjList_clone[v] = adjList_clone[v].filter((neighbor: string) => neighbor !== u);
    }
  }

  const dfs = (currentNode: string, visited: Set<string>) => {
    if (currentNode === u) {
      return true;
    }
    visited.add(currentNode);

    const neighbors = adjList_clone[currentNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, visited)) {
          return true;
        }
      }
    }

    return false;
  };

  const canReturn = dfs(v, new Set());

  return !canReturn;
}

class AlgorithmEuler {
  static Hierholzer = (cyInstanceRef: React.RefObject<Core | null>, start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean, currentStep: number): AlgorithmDataRunning => {
    const cy = cyInstanceRef.current;
    if (!cy) return {
      step: [],
      eulerCycle: [],
    };

    const steps: stepInfo[] = [];
    const stepsCounter = { count: currentStep };
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
  static Fleury = (cyInstanceRef: React.RefObject<Core | null>, start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean, currentStep: number): AlgorithmDataRunning => {
    const cy = cyInstanceRef.current;
    if (!cy) return {
      step: [],
      eulerCycle: [],
    };

    const steps: stepInfo[] = [];
    const stepsCounter = { count: currentStep };
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

      const neighbors = adjList[curr];
      let next = null;
      if (neighbors && neighbors.length === 1) {
        next = neighbors[0];
        steps.push({
          step: stepsCounter.count++,
          description: `Chỉ có một lối ra duy nhất ('${cy.$id(curr).data("label")}' -> '${cy.$id(next).data("label")}'). Bắt buộc đi theo cạnh này.`,
          eulerCycle: [...eulerCycle],
          action: { type: 'traverse', from: curr, to: next }
        });
      } else {
        for (const v of adjList[curr]) {
          steps.push({
            step: stepsCounter.count++,
            description: `Kiểm tra cạnh ('${cy.$id(curr).data("label")}' -> '${cy.$id(v).data("label")}') có phải là cạnh cầu không ?`,
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
        // if (!next) {
        //   next = adjList[curr][0];
        //   steps.push({
        //     step: stepsCounter.count++,
        //     description: `Không tìm thấy cạnh không phải là cạnh cầu. Chọn cạnh cầu đầu tiên ('${cy.$id(curr).data("label")} !' --> '${cy.$id(next).data("label")}')`,
        //     eulerCycle: [...eulerCycle],
        //     action: { type: 'traverse', from: curr, to: next }
        //   });
        // }
      }

      if (next) {
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
    }

    return {
      step: steps,
      eulerCycle: eulerCycle,
    };
  }
}

export default AlgorithmEuler;