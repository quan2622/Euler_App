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

  const { adjacencyList,
    interconnects,
    nodeDegrees,
    adjacencyMatrix,
    nodeLabels,
    edgeCounter,
    nodeCounter,
  } = useGraphStatusStore();


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

    let start = startNodeRef.current?.data("label");
    if (!start) {
      for (const node of Object.keys(adjacencyList)) {
        if (adjacencyList[node].length > 0) {
          start = node;
          break;
        }
      }
    }

    if (!start) return [];

    const eulerPath: string[] = [];
    const stack: string[] = [start];

    while (stack.length > 0) {
      const curr = stack[stack.length - 1];
      console.log("Check list: ", adjacencyList[curr], " - ", curr);
      if (adjacencyList[curr].length > 0) {
        const next = adjacencyList[curr].pop();
        if (!isDirectedGraph) {
          const index = adjacencyList[next!].indexOf(curr);
          if (index > -1) {
            adjacencyList[next!].splice(index, 1);
          }
        }
        stack.push(next!);
      } else {
        eulerPath.push(stack.pop()!)
      }
    };

    // return eulerPath.reverse();

    console.log("Check Euler Path: ", eulerPath.reverse());
  }, [isDirectedGraph, adjacencyList]);


  console.group('📊 Graph Status');
  console.log('🔗 Adjacency List:', adjacencyList);
  console.log("Check start node ref: ", startNodeRef.current?.data("label"));
  console.log('🔁 Interconnects:', interconnects);
  console.log('📈 Node Degrees:', nodeDegrees);
  console.log('🧮 Adjacency Matrix:', adjacencyMatrix);
  console.log('🏷️ Node Labels:', nodeLabels);
  console.log('➕ Edge Counter:', edgeCounter);
  console.log('🔢 Node Counter:', nodeCounter);
  console.groupEnd();

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
        <div className="w-96 border-blue-600 border-2">
          <Button onClick={findEulerPath}>Euler</Button>
        </div>
      </div>
    </>
  )
}
export default MainLayout