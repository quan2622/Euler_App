import { useRef, useState } from "react"
import type { Core, NodeSingular } from "cytoscape";
import GraphToolbar from "./components/GraphToolbar";
import GraphCanvas from "./components/GraphCanvas";
import { useAlgorithm } from "../hooks/useAlgorithm";
import AppSiderbar from "./components/AppSiderBar";
import { useRunGraphAlgorithm } from "../hooks/useRunGraphAlgorithm";
import { useGraphStore } from "../store/useGraphStore";

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

  // *note: KT chạy thuật toán euler tìm cách để có thẻ chỉ cần thay thế đoạn thuật toán thành thuật toán khác || chạy code thì tô đậm phần đang chạy lên ✅


  const { findEulerPath, handleChangeStart } = useAlgorithm(cyInstance, startNodeRef, isDirectedGraph);
  const { animateIsPause, handlePlayAlgorithm, nextStep, togglePlayAlgorithm, resetAnimation } = useRunGraphAlgorithm(cyInstance, startNodeRef, isDirectedGraph);

  const { selectAlgorithm, suggestMess } = useGraphStore();

  // const [isTogglePlay, setIsTogglePlay] = useState(false);

  // HANLE FIND EULER
  // const handlePlayAlgorithm = () => {
  //   let flag = 0;
  //   if (!startNodeRef.current) {
  //     flag = 1;
  //   }

  //   // MAIN
  //   const result = findEulerPath(selectAlgorithm);
  //   if (result.length === 0) return;
  //   // togglePlayAlgorithm(result);
  //   handleRunAnimate(result);

  //   // Had error
  //   if (suggestMess !== "") {
  //     return;
  //   }
  //   // udpate start node if dont select start node before run algorithm
  //   if (flag === 1)
  //     handleChangeStart(startNodeRef.current?.data("label"));


  //   console.log("Check result EC: ", result);
  // }
  // HANLE FIND EULER
  // console.log("Check toggle play: ", isTogglePlay);

  return (
    <>
      <div className="flex h-screen flex-1 bg-zinc-500 w-full">
        <div className="flex-1 flex flex-col">
          <div className="border-zinc-200 border-b-2 bg-slate-100">
            <GraphToolbar
              cyInstance={cyInstance}
              isDirectedGraph={isDirectedGraph}
              onToggleDirected={onToggleDirected}
              nextStep={nextStep}
              resetAnimation={resetAnimation}
              handlePlayAlgorithm={handlePlayAlgorithm}
              animateIsPause={animateIsPause}
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
            handlePlayAlgorithm={togglePlayAlgorithm}
          />
        </div>
      </div>
    </>

  )
}
export default MainLayout