import { useRef, useState } from "react"
import type { Core, NodeSingular } from "cytoscape";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";
import { useAlgorithm } from "../hooks/useAlgorithm";
import AppSiderbar from "./components/AppSiderBar";
import { useRunGraphAlgorithm } from "../hooks/useRunGraphAlgorithm";

const MainLayout = () => {
  const cyInstance = useRef<Core | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(false);
  const startNodeRef = useRef<NodeSingular | null>(null);

  const onToggleDirected = (type?: boolean) => {
    if (type === undefined) {
      setIsDirectedGraph(prev => !prev);
    } else {
      setIsDirectedGraph(type);
    }
  }

  // console.group('📊 Graph Status');
  // console.log('🔗 Adjacency List:', adjacencyList);
  // console.log("Check start node ref: ", startNodeRef.current?.data("label"));
  // console.log('🔁 Interconnects:', interconnects);
  // console.log('📈 Node Degrees:', nodeDegrees);
  // console.log('🧮 Adjacency Matrix:', adjacencyMatrix);
  // console.log('🏷️ Node Labels:', nodeLabels);
  // console.log('➕ Edge Counter:', edgeCounter);
  // console.log('🔢 Node Counter:', nodeCounter);
  // console.groupEnd();

  const { handleChangeStart } = useAlgorithm(cyInstance, startNodeRef, isDirectedGraph);
  const { animateIsPause, handlePlayAlgorithm, nextStep, resetAnimation } = useRunGraphAlgorithm(cyInstance, startNodeRef, isDirectedGraph);

  // const { isEndAlgorithm } = useGraphStatusStore();

  // console.log("Check status run: ", isEndAlgorithm);

  return (
    <>
      <div className="flex h-screen flex-1 bg-zinc-500 w-full">
        <div className="flex-1 flex flex-col">
          <div className="border-zinc-200 border-b-2 bg-slate-100">
            <GraphToolbar
              startNodeRef={startNodeRef}
              cyInstance={cyInstance}
              isDirectedGraph={isDirectedGraph}
              onToggleDirected={onToggleDirected}
              nextStep={nextStep}
              resetAnimation={resetAnimation}
              handlePlayAlgorithm={handlePlayAlgorithm}
              animateIsPause={animateIsPause}
              handleChangeStart={handleChangeStart}
            />
          </div>
          {/* Graph Container */}
          <GraphCanvas
            cyInstanceRef={cyInstance}
            isDirectedGraph={isDirectedGraph}
            startNodeRef={startNodeRef}
          />
        </div>
        <div className="w-96 border-zinc-200 border-l-2 bg-slate-100">
          <AppSiderbar
            isDirectedGraph={isDirectedGraph}
            handleChangeStart={handleChangeStart}
            handlePlayAlgorithm={handlePlayAlgorithm}
          />
        </div>
      </div>
    </>

  )
}
export default MainLayout