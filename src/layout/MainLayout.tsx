import { useRef, useState } from "react"
import type { Core, EdgeSingular } from "cytoscape";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";
import { useGraphStatusStore } from "../store/useGraphStatusStore";

const MainLayout = () => {
  const cyInstance = useRef<Core | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(true);

  const { interconnects, nodeDegrees, adjacencyList, adjacencyMatrix, nodeLabels, nodeCounter, edgeCounter } = useGraphStatusStore();


  // Refs đếm số lượng node và edge để tạo ID duy nhất
  const startNodeRef = useRef<EdgeSingular | null>(null);

  // handle analystic

  const onToggleDirected = (type?: boolean) => {
    if (type === undefined) {
      setIsDirectedGraph(prev => !prev);
    } else {
      setIsDirectedGraph(type);
    }
  }

  return (
    <>
      <div className="flex h-screen bg-zinc-500">
        <div className="flex-1 flex flex-col">
          <GraphToolbar
            cyInstance={cyInstance}
            isDirectedGraph={isDirectedGraph}
            onToggleDirected={onToggleDirected}
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

        </div>
      </div>
    </>
  )
}
export default MainLayout