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
  static Hierholzer = (start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): string[] => {
    const eulerCircle: string[] = [];
    const stack: string[] = [start];

    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      if (adjList[curr].length > 0) {
        const next = adjList[curr].pop();
        if (!isDirectedGraph && next) {
          const index = adjList[next].indexOf(curr);
          adjList[next].splice(index, 1);
        }
        stack.push(next!);
      } else {
        eulerCircle.push(stack.pop()!)
      }
    };

    return eulerCircle.reverse();
  }

  static Flery = (start: string, adjList: { [key: string]: string[] }, isDirectedGraph: boolean): string[] => {
    const eulerCircle: string[] = [];
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
        eulerCircle.push(stack.pop()!)
      }
    }
    return eulerCircle.reverse();
  }
}

export default AlgorithmEuler;