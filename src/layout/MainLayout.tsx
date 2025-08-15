import { useRef, useState } from "react"
import type { Core, NodeSingular } from "cytoscape";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";
import { useAlgorithm } from "../hooks/useAlgorithm";
import AppSiderbar from "./components/AppSiderBar";
import { useRunGraphAlgorithm } from "../hooks/useRunGraphAlgorithm";

const MainLayout = () => {
  const cyInstance = useRef<Core | null>(null);
  const startNodeRef = useRef<NodeSingular | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(false);

  // CUSTOM - HOOK
  const { handleChangeStart } = useAlgorithm(cyInstance, startNodeRef, isDirectedGraph);
  // CUSTOM - HOOK

  const { animateIsPause, handlePlayAlgorithm, nextStep, prevStep, resetAnimation } = useRunGraphAlgorithm(cyInstance, startNodeRef, isDirectedGraph);

  const onToggleDirected = (type?: boolean) => {
    if (type === undefined) {
      setIsDirectedGraph(prev => !prev);
    } else {
      setIsDirectedGraph(type);
    }
  }

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
              prevStep={prevStep}
              resetAnimation={resetAnimation}
              handlePlayAlgorithm={handlePlayAlgorithm}
              animateIsPause={animateIsPause}
              handleChangeStart={handleChangeStart}
            />
          </div>
          {/* ===================== Graph Container ===================== */}
          <GraphCanvas
            cyInstanceRef={cyInstance}
            isDirectedGraph={isDirectedGraph}
            startNodeRef={startNodeRef}
          />
          {/* ===================== Graph Container ===================== */}
        </div>
        <div className="w-96 border-zinc-200 border-l-2 bg-slate-100">
          <AppSiderbar
            cyInstanceRef={cyInstance}
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