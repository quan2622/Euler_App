import { useCallback, useRef, useState } from "react"
import type { Core, NodeSingular } from "cytoscape";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";
import { useGraphStatusStore } from "../store/useGraphStatusStore";
import { Button } from "../components/ui/button";

const MainLayout = () => {
  const cyInstance = useRef<Core | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(false);
  const startNodeRef = useRef<NodeSingular | null>(null);

  const { adjacencyList } = useGraphStatusStore();

  const onToggleDirected = (type?: boolean) => {
    if (type === undefined) {
      setIsDirectedGraph(prev => !prev);
    } else {
      setIsDirectedGraph(type);
    }
  }

  // const findEulerPath = useCallback(() => {
  //   const cy = cyInstance.current;
  //   if (!cy) return;
  //   const startNodeId = startNodeRef.current?.id();
  //   console.log("Check start: ", startNodeId);
  //   // return;

  //   const adjList: { [key: string]: string[] } = {};
  //   const nodes = cy.nodes();

  //   nodes.forEach((node: NodeSingular) => { adjList[node.id()] = [] });

  //   const edges = cy.edges();
  //   edges.forEach((edge: EdgeSingular) => {
  //     const source = edge.source().id()
  //     const target = edge.target().id()

  //     adjList[source].push(target)
  //     if (!isDirectedGraph) {
  //       adjList[target].push(source)
  //     }
  //   })

  //   let start = startNodeId;
  //   if (!start) {
  //     for (const nodeId of Object.keys(adjList)) {
  //       if (adjList[nodeId].length > 0) {
  //         start = nodeId;
  //         break;
  //       }
  //     }
  //   }

  //   if (!start) return [];

  //   const eulerPath: string[] = [];
  //   const stack: string[] = [start];

  //   while (stack.length > 0) {
  //     const curr = stack[stack.length - 1];
  //     if (adjList[curr].length > 0) {
  //       const next = adjList[curr].pop();
  //       if (!isDirectedGraph) {
  //         const index = adjList[next!].indexOf(curr);
  //         if (index > -1) {
  //           adjList[next!].splice(index, 1);
  //         }
  //       }
  //       stack.push(next!);
  //     } else {
  //       eulerPath.push(stack.pop()!)
  //     }
  //   };

  //   // return eulerPath.reverse();

  //   console.log("Check Euler Path: ", eulerPath.reverse());
  // }, [isDirectedGraph]);

  const findEulerPath = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const adjList = Object.fromEntries(
      Object.entries(adjacencyList).map(([k, v]) => [k, [...v]])
    );

    let start = startNodeRef.current?.data("label");
    if (!start) {
      for (const node of Object.keys(adjList)) {
        if (adjList[node].length > 0) {
          start = node;
          break;
        }
      }
    }
    if (!start) return [];

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

    // return eulerCircle.reverse();

    console.log("Check Euler Path with Hierholzer: ", eulerCircle.reverse());
  }, [isDirectedGraph, adjacencyList]);

  // Thuật toán Fleury
  const counNodeWithDFS = (u: string, adjArr: string[], visited: Map<string, boolean>): number => {
    visited.set(u, true);
    let count = 1;
    for (const item of adjArr) {
      if (!visited.get(u))
        count += counNodeWithDFS(item, adjArr, visited);
    }
    return count;
  }

  const isBridge = (u: string, v: string, adjList: { [key: string]: string[] }) => {
    const visited = new Map<string, boolean>();
    for (const [key, value] of Object.entries(adjList)) {
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

    for (const [key, value] of Object.entries(adjList)) {
      visited.set(key, false);
    }
    const count_after = counNodeWithDFS(u, adjList_clone[u], visited);

    return count_before > count_after;
  }

  const eulerWithFleury = () => {
    const cy = cyInstance.current;
    if (!cy) return;

    const adjList = Object.fromEntries(
      Object.entries(adjacencyList).map(([k, v]) => [k, [...v]])
    );

    console.log("Check adjList: ", JSON.stringify(adjList, null, 2));

    let start = startNodeRef.current?.data("label");
    if (!start) {
      for (const node of Object.keys(adjList)) {
        if (adjList[node].length > 0) {
          start = node;
          break;
        }
      }
    }
    if (!start) return [];

    console.log("Check start: ", start);

    const eulerCircle: string[] = [];
    const stack: string[] = [start];

    while (stack.length > 0) {
      const u = stack[stack.length - 1];

      if (adjList[u].length > 0) {
        let v = adjList[u][adjList[u].length - 1];
        console.log("Check v: ", v);
        for (const next of [...adjList[u]].reverse()) {
          if (!isBridge(u, next, adjList)) {
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

    // return eulerCircle.reverse();
    console.log("Check Euler Path With Fleury: ", eulerCircle.reverse());
  }


  // DFS_Base
  const aulerWothDFS_Base = () => {
    const cy = cyInstance.current;
    if (!cy) return;

    const adjList = Object.fromEntries(
      Object.entries(adjacencyList).map(([k, v]) => [k, [...v]])
    );

    console.log("Check adjList: ", JSON.stringify(adjList, null, 2));

    let start = startNodeRef.current?.data("label");
    if (!start) {
      for (const node of Object.keys(adjList)) {
        if (adjList[node].length > 0) {
          start = node;
          break;
        }
      }
    }
    if (!start) return [];

    console.log("Check start: ", start);

    const eulerCircle: string[] = [];
    const visited = new Map<string, Set<string>>();
    for (const [key] of Object.entries(adjList)) {
      visited.set(key, new Set());
    }
    console.log("Check visited: ", visited);
    const stack: string[] = [start];

    while (stack.length > 0) {
      const u = stack[stack.length - 1];
      let has_unvisited = false;
      for (const node of [...adjList[u]].reverse()) {
        console.log("Check if: ", visited.get(u)?.has(node), ' - ', node);
        if (!visited.get(u)?.has(node)) {
          visited.get(u)?.add(node);
          if (!isDirectedGraph) {
            visited.get(node)?.add(u);
          }
          stack.push(node);
          has_unvisited = true;
          break;
        }
      }
      console.log("Check after: ", has_unvisited);
      if (!has_unvisited) {
        eulerCircle.push(stack.pop()!)
      }
    }

    // return eulerCircle.reverse();

    console.log("Check Euler Path with DFS_Base: ", eulerCircle.reverse());
  }





  // console.group('📊 Graph Status');
  console.log('🔗 Adjacency List:', adjacencyList);
  // console.log("Check start node ref: ", startNodeRef.current?.data("label"));
  // console.log('🔁 Interconnects:', interconnects);
  // console.log('📈 Node Degrees:', nodeDegrees);
  // console.log('🧮 Adjacency Matrix:', adjacencyMatrix);
  // console.log('🏷️ Node Labels:', nodeLabels);
  // console.log('➕ Edge Counter:', edgeCounter);
  // console.log('🔢 Node Counter:', nodeCounter);
  // console.groupEnd();

  // *note: KT chạy thuật toán euler tìm cách để có thẻ chỉ cần thay thế đoạn thuật toán thành thuật toán khác || chạy code thì tô đậm phần đang chạy lên


  return (
    <>
      <div className="flex h-screen bg-zinc-500">
        <div className="flex-1 flex flex-col">
          <GraphToolbar
            cyInstance={cyInstance}
            isDirectedGraph={isDirectedGraph}
            onToggleDirected={onToggleDirected}
            startNodeRef={startNodeRef}
          />
          <div className="h-20 w-full bg-white border-orange-600   border-2">
            aaaaa
          </div>
          {/* Graph Container */}
          <GraphCanvas
            cyInstanceRef={cyInstance}
            isDirectedGraph={isDirectedGraph}
            startNodeRef={startNodeRef}
          />
        </div>
        <div className="w-96 border-blue-600 border-2 flex flex-col gap-2">
          <Button onClick={findEulerPath}>Euler with Hierholzer</Button>
          <Button onClick={eulerWithFleury}>Euler with Fleury</Button>
          <Button onClick={aulerWothDFS_Base}>Euler with DFS_Base</Button>
        </div>
      </div>
    </>
  )
}
export default MainLayout