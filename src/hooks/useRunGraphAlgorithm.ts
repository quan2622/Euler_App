import type { Core, EdgeCollection, EdgeSingular, NodeSingular } from "cytoscape"
import { useState } from "react";
import { toast } from "sonner";
import { useAlgorithm } from "./useAlgorithm";
import { useGraphStore } from "../store/useGraphStore";

export const useRunGraphAlgorithm = (
  cyInstanceRef: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>,
  isDirectedGraph: boolean,
) => {


  const { findEulerPath, handleChangeStart } = useAlgorithm(cyInstanceRef, startNodeRef, isDirectedGraph);
  const { selectAlgorithm, suggestMess } = useGraphStore();

  const [eulerAnimateStep, setEulerAnimateStep] = useState(0);
  const [animateInterval, setAnimateInterval] = useState<NodeJS.Timeout | null>(null);
  const [animateIsPause, setAnimateIsPause] = useState<boolean>(true);
  const [currentEulerPath, setCurrentEulerPath] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);

  const highLightPath = (currNodeId: string, nextNodeId: string, visited: string[]) => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    let selectedEdge: EdgeSingular | null = null;
    let allEdges: EdgeCollection | null = null;
    if (!isDirectedGraph) {
      allEdges = cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"], [source="${nextNodeId}"][target="${currNodeId}"]`);
    } else {
      allEdges = cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"]`);
    }

    for (let i = 0; i < allEdges.length; i++) {
      const edge = allEdges[i];
      const edgeId = edge.id();

      if (!visited.includes(edgeId)) {
        selectedEdge = edge;
        break;
      }
    }

    if (selectedEdge) {
      visited.push(selectedEdge.id());
      selectedEdge.addClass("euler-path");
    }
  }

  // START-RUN ANIMATE
  const handleRunAnimate = (EC: string[], stepByStep: boolean = false) => {
    const cy = cyInstanceRef.current;
    if (!cy || !EC || EC.length === 0) return;

    setEulerAnimateStep(0);
    setAnimateIsPause(false);
    setCurrentEulerPath([...EC]);
    setVisitedEdges([]);

    cy.elements().removeClass("hasSelected");

    let step = 0;
    const path = [...EC];
    const visited: string[] = [];

    const executeStep = () => {
      if (step >= path.length - 1) {
        setAnimateInterval(null);
        setAnimateIsPause(true);
        return;
      }

      const currNodeId = path[step];
      const nextNodeId = path[step + 1];

      highLightPath(currNodeId, nextNodeId, visited);
      setVisitedEdges([...visited]);

      step++;
      setEulerAnimateStep(step);

      if (step >= path.length - 1) {
        cy.$id(nextNodeId).addClass("end");
        toast.success("Tìm thấy chu trình Euler");

        setAnimateInterval(null);
        setAnimateIsPause(true);
        return;
      }
      console.log(">> my check: ", stepByStep);
      if (!stepByStep) {
        const interval = setTimeout(executeStep, 1000);
        setAnimateInterval(interval);
        console.log(">> my check 1");
      }
    }

    executeStep();

  }
  // END-RUN ANIMATE


  const nextStep = () => {
    const cy = cyInstanceRef.current;
    if (!cy || currentEulerPath.length === 0) return;

    const path = [...currentEulerPath];
    const visited: string[] = [...visitedEdges];

    const currStep = eulerAnimateStep;
    if (currStep >= path.length - 1) {
      toast.info("Đã hoàn thành tất cả các bước");
      return;
    }

    const currNodeId = path[currStep];
    const nextNodeId = path[currStep + 1];
    highLightPath(currNodeId, nextNodeId, visited);
    setVisitedEdges(visited);

    const newStep = currStep + 1;
    setEulerAnimateStep(newStep);

    if (newStep >= path.length - 1) {
      cy.$id(nextNodeId).addClass("end");
      toast.success("Tìm thấy chu trình Euler");
      setAnimateIsPause(true);
      return;
    }
  }

  const resetAnimation = () => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    if (animateInterval) {
      clearTimeout(animateInterval);
      setAnimateInterval(null)
    }

    cy.elements().removeClass("euler-path end");
    setEulerAnimateStep(0);
    setAnimateIsPause(true);
  }

  const handlePlayAlgorithm = (stepByStep: boolean = false) => {
    const needUpdateStart = !startNodeRef.current

    // MAIN
    const result = findEulerPath(selectAlgorithm);
    if (result.length === 0 && suggestMess !== "") return;

    // udpate start node if dont select start node before run algorithm
    if (needUpdateStart && startNodeRef.current) {
      handleChangeStart(startNodeRef.current.data("label"));
    }

    console.log("Check result EC: ", result);

    // RUN ANIMATE
    handleRunAnimate(result, stepByStep);
  }


  return {
    animateIsPause,
    handlePlayAlgorithm,

    handleRunAnimate,
    nextStep,
    resetAnimation,
  }

}