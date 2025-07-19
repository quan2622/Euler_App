import { useRef, useState } from "react"
import type { Core, EdgeSingular, NodeSingular } from "cytoscape";
import type { GraphAnalysis } from "../types/graph.type";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";

const MainLayout = () => {
  const cyInstance = useRef<Core | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(true);
  const [currentLayout, setCurrentLayout] = useState("grid");

  const [graphAnalysis, setGraphAnalysis] = useState<GraphAnalysis>({
    adjacencyMatrix: [],
    adjacencyList: {},
    nodeDegrees: {},
    nodeLabels: [],
  });

  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedNode, setSelectedNode] = useState<NodeSingular | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<EdgeSingular | null>(null)
  const [connectedComponents, setConnectedComponents] = useState<string[][]>([])


  // Refs đếm số lượng node và edge để tạo ID duy nhất
  const nodeCounterRef = useRef(1)
  const edgeCounterRef = useRef(1)
  const startNodeRef = useRef<EdgeSingular | null>(null);

  // handle analystic

  const onToggleDirected = () => {
    setIsDirectedGraph(prev => !prev);
  }

  return (
    <>
      <div className="flex h-screen bg-zinc-500">
        <div className="flex-1 flex flex-col">
          <GraphToolbar isDirectedGraph={isDirectedGraph} onToggleDirected={onToggleDirected} />

          {/* Graph Container */}
          <GraphCanvas
            cyInstanceRef={cyInstance}
            isDirectedGraph={isDirectedGraph}
            nodeCounterRef={nodeCounterRef}
            edgeCounterRef={edgeCounterRef}
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