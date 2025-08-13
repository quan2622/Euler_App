import type { Core, EdgeCollection, EdgeSingular, NodeSingular } from "cytoscape"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAlgorithm } from "./useAlgorithm";
import { useGraphStore } from "../store/useGraphStore";
import { useGraphStatusStore } from "../store/useGraphStatusStore";
import type { stepInfo } from "../types/graph.type";

export const useRunGraphAlgorithm = (
  cyInstanceRef: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>,
  isDirectedGraph: boolean,
) => {
  const [startReult, setStartResult] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);


  const { findEulerPath, handleChangeStart } = useAlgorithm(cyInstanceRef, startNodeRef, isDirectedGraph);
  const { selectAlgorithm, suggestMess } = useGraphStore();
  const { updateIsEndAlgorithm, updateResult } = useGraphStatusStore();

  const [eulerAnimateStep, setEulerAnimateStep] = useState(0);
  const [animateInterval, setAnimateInterval] = useState<NodeJS.Timeout | null>(null);
  const [animateIsPause, setAnimateIsPause] = useState<boolean>(true);
  const [currentEulerPath, setCurrentEulerPath] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);

  // test
  const [animationScript, setAnimationScript] = useState<stepInfo[]>([]);

  const highLightPath = (currNodeId: string, nextNodeId: string, visited: string[], type: "traverse" | "unhighlight"): string[] => {
    const cy = cyInstanceRef.current;
    if (!cy) return visited;

    const clone_visited = [...visited];

    let selectedEdge: EdgeSingular | null = null;
    let allEdges: EdgeCollection | null = null;
    if (!isDirectedGraph) {
      allEdges = cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"], [source="${nextNodeId}"][target="${currNodeId}"]`);
    } else {
      allEdges = cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"]`);
    }

    if (type == "traverse") {
      for (let i = 0; i < allEdges.length; i++) {
        const edge = allEdges[i];
        const edgeId = edge.id();

        if (!visited.includes(edgeId)) {
          selectedEdge = edge;
          break;
        }
      }

      if (selectedEdge) {
        clone_visited.push(selectedEdge.id());
        selectedEdge.addClass("euler-path");
      }
    } else {
      let edgeToUnhighlight: EdgeSingular | null = null;
      let indexToRemove = -1;
      const edgeIds = allEdges.map(i => i.id());

      for (let i = clone_visited.length - 1; i >= 0; i--) {
        const edgeId = clone_visited[i];
        const edge = cy.$id(edgeId);
        if (edge.length > 0 && edgeIds.includes(edgeId)) {
          edgeToUnhighlight = edge;
          indexToRemove = i;
          break;
        }
      }

      if (edgeToUnhighlight && indexToRemove > -1) {
        edgeToUnhighlight.removeClass("euler-path");
        clone_visited.splice(indexToRemove, 1);
      }
    }
    return clone_visited;
  }

  // START-RUN ANIMATE
  // const handleRunAnimate = (EC: string[], stepByStep: boolean = false) => {
  //   const cy = cyInstanceRef.current;
  //   if (!cy || !EC || EC.length === 0) return;

  //   setEulerAnimateStep(0);
  //   setAnimateIsPause(false);
  //   setCurrentEulerPath([...EC]);
  //   setVisitedEdges([]);

  //   cy.elements().removeClass("hasSelected");

  //   let step = 0;
  //   const path = [...EC];
  //   const visited: string[] = [];

  //   const executeStep = () => {
  //     if (step >= path.length - 1) {
  //       setAnimateInterval(null);
  //       setAnimateIsPause(true);
  //       updateIsEndAlgorithm(true);

  //       return;
  //     }

  //     const currNodeId = path[step];
  //     const nextNodeId = path[step + 1];

  //     highLightPath(currNodeId, nextNodeId, visited);
  //     setVisitedEdges([...visited]);

  //     step++;
  //     setEulerAnimateStep(step);

  //     if (step >= path.length - 1) {
  //       cy.$id(nextNodeId).addClass("end");
  //       toast.success("Tìm thấy chu trình Euler");

  //       setAnimateInterval(null);
  //       setAnimateIsPause(true);
  //       updateIsEndAlgorithm(true);
  //       return;
  //     }
  //     if (!stepByStep) {
  //       const interval = setTimeout(executeStep, 1000);
  //       setAnimateInterval(interval);
  //     }
  //   }

  //   executeStep();

  // }

  // test
  const handleRunAnimate = (stepByStep: boolean = false, scriptStep: stepInfo[]) => {
    const cy = cyInstanceRef.current;
    if (!cy || scriptStep.length === 0) return;

    setEulerAnimateStep(0);
    setAnimateIsPause(false);
    setVisitedEdges([]);
    cy.elements().removeClass("hasSelected");

    let stepIndex = 0;
    const script = [...scriptStep];
    let localVisited: string[] = [];

    const executeStep = () => {
      if (stepIndex >= script.length) {
        setAnimateInterval(null);
        setAnimateIsPause(true);
        updateIsEndAlgorithm(true);

        setStartResult(true);
        return;
      }

      const currentStepData = script[stepIndex];
      if (currentStepData.action) {
        const { from, to, type } = currentStepData.action;
        localVisited = highLightPath(from, to, localVisited, type);
        setVisitedEdges(localVisited);
      }

      stepIndex++;
      setEulerAnimateStep(stepIndex);

      if (stepIndex >= script.length) {
        if (typeof currentStepData?.action?.to === "string") {
          cy.$id(currentStepData.action.to).addClass("end");
        }
        toast.success("Tìm thấy chu trình Euler");
      }

      if (!stepByStep) {
        const interval = setTimeout(executeStep, 1000);
        setAnimateInterval(interval);
      }
    }

    executeStep();
  }
  // test
  // END-RUN ANIMATE


  const nextStep = () => {
    const cy = cyInstanceRef.current;
    if (!cy || currentEulerPath.length === 0) return;

    const path = [...currentEulerPath];
    const visited: string[] = [...visitedEdges];

    const currStep = eulerAnimateStep;
    if (currStep >= path.length - 1) {
      toast.info("Đã hoàn thành tất cả các bước");
      updateIsEndAlgorithm(true);

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
      updateIsEndAlgorithm(true);
      return;
    }
  }

  const prevStep = () => {
    const cy = cyInstanceRef.current;
    if (!cy || currentEulerPath.length === 0 || eulerAnimateStep <= 0) return;

    // Remove highlight from current step
    const currNodeId = currentEulerPath[eulerAnimateStep - 1];
    const nextNodeId = currentEulerPath[eulerAnimateStep];

    // Remove last visited edge
    const newVisited = [...visitedEdges];
    newVisited.pop();
    setVisitedEdges(newVisited);

    // Remove highlighting from edges
    if (!isDirectedGraph) {
      cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"], [source="${nextNodeId}"][target="${currNodeId}"]`)
        .removeClass("euler-path");
    } else {
      cy.edges(`[source="${currNodeId}"][target="${nextNodeId}"]`)
        .removeClass("euler-path");
    }

    // Remove end node highlighting if we're moving back from last step
    if (eulerAnimateStep === currentEulerPath.length - 1) {
      cy.$id(nextNodeId).removeClass("end");
    }

    // Update step counter
    setEulerAnimateStep(eulerAnimateStep - 1);

    // Reset end algorithm status if we're moving back from last step
    if (eulerAnimateStep === currentEulerPath.length - 1) {
      updateIsEndAlgorithm(false);
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

    // RESET STATE INNER HOOK
    setAnimateIsPause(true);
    setEulerAnimateStep(0);
    updateIsEndAlgorithm(false);
    setCurrentEulerPath([]);
    setVisitedEdges([]);

    // RESET DATA RESULT
    updateResult({ eulerCycle: [], stepInfo: [], sugMess: "", errMess: "", isCycle: true });
    handleChangeStart("");
    startNodeRef.current = null;
  }

  const handlePlayAlgorithm = (stepByStep: boolean = false) => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    // RESET OLD DATA
    cy.elements().removeClass("euler-path end");

    setEulerAnimateStep(0);
    updateIsEndAlgorithm(false);
    setCurrentEulerPath([]);
    setVisitedEdges([]);

    // RESET DATA RESULT
    updateResult({ eulerCycle: [], stepInfo: [], sugMess: "", errMess: "" });

    const needUpdateStart = !startNodeRef.current
    // MAIN
    const { step, eulerCycle } = findEulerPath(selectAlgorithm);
    if (eulerCycle.length === 0 && suggestMess !== "") return;

    setResult(eulerCycle);
    setStartResult(false);
    // udpate start node if dont select start node before run algorithm
    if (needUpdateStart && startNodeRef.current) {
      handleChangeStart(startNodeRef.current.data("label"));
    }
    // RUN ANIMATE

    // Custom StepScript
    let indexStepCustom = 1;
    const configStep: stepInfo[] = step.reduce((acc, item) => {
      if (item.action != null) {
        acc.push({
          step: indexStepCustom++,
          action: { ...item.action },
        });
      }
      return acc;
    }, [] as stepInfo[]);

    console.log("Check :", configStep);

    if (configStep && configStep.length === 0) return;

    setAnimationScript(configStep);
    handleRunAnimate(stepByStep, configStep);
    // test
  }

  useEffect(() => {
    const cy = cyInstanceRef.current
    if (startReult && result && cy) {
      cy.elements().removeClass("euler-path end");

      setEulerAnimateStep(0);
      updateIsEndAlgorithm(false);
      setCurrentEulerPath([]);
      setVisitedEdges([]);

      const customResult: stepInfo[] = [];
      for (let i = 0; i < result.length - 1; i++) {
        const curr = result[i];
        const next = result[i + 1];
        customResult.push({
          step: i + 1,
          action: { type: "traverse", from: curr, to: next },
        })
      }
      setTimeout(() => {
        handleRunAnimate(false, customResult);
      }, 1000);
    }
  }, [startReult, result]);

  return {
    animateIsPause,
    handlePlayAlgorithm,

    handleRunAnimate,
    nextStep,
    prevStep,
    resetAnimation,
  }

}