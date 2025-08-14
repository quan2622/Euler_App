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
  const { isEndAlgorithm, updateIsEndAlgorithm, updateResult, updateStepbyStepInfo, updateStatusStepByStep } = useGraphStatusStore();

  const [eulerAnimateStep, setEulerAnimateStep] = useState(0);
  const [animateInterval, setAnimateInterval] = useState<NodeJS.Timeout | null>(null);
  const [animateIsPause, setAnimateIsPause] = useState<boolean>(true);
  const [currentEulerPath, setCurrentEulerPath] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);

  // test
  const [animationScript, setAnimationScript] = useState<stepInfo[]>([]);
  const [isStep, setIsStep] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);

  const highLightPath = (currNodeId: string, nextNodeId: string, visited: string[], type: "traverse" | "unhighlight", isResult = false): string[] => {
    const cy = cyInstanceRef.current;
    if (!cy) return visited;
    console.log("Check hightlight: ", currNodeId, nextNodeId, " - ", type);
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
        selectedEdge.addClass(`${isResult ? "euler-path" : "AL-path"}`);
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
        edgeToUnhighlight.removeClass(`${isResult ? "euler-path" : "AL-path"}`);
        clone_visited.splice(indexToRemove, 1);
      }
    }
    return clone_visited;
  }

  // START-RUN ANIMATE
  const handleRunAnimate = (stepByStep: boolean = false, scriptStep: stepInfo[], isResult = false, duration = 1000) => {
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
        updateStatusStepByStep(false);
        if (!isEndAlgorithm) {
          setIsDisplay(true);
        }
        return;
      }

      const currentStepData = script[stepIndex];
      if (stepByStep) {
        updateStepbyStepInfo(currentStepData);
      }
      if (currentStepData.action) {
        const { from, to, type } = currentStepData.action;
        localVisited = highLightPath(from, to, localVisited, type, isResult);
        setVisitedEdges(localVisited);
      }

      stepIndex++;
      setEulerAnimateStep(stepIndex);

      if (stepIndex >= script.length) {
        if (typeof currentStepData?.action?.to === "string" && !isStep) {
          cy.$id(currentStepData.action.to).addClass("end");
        }
        console.log("Check is end algorithm: ", isEndAlgorithm);
        if (!isDisplay) {
          toast.success("Tìm thấy chu trình Euler");
        }
      }

      if (!stepByStep) {
        const interval = setTimeout(executeStep, duration);
        setAnimateInterval(interval);
      }
    }

    executeStep();
  }
  // test
  // END-RUN ANIMATE


  const nextStep = () => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    let visited: string[] = [...visitedEdges];
    const currStep = eulerAnimateStep;
    // if (currStep + 1 >= animationScript.length) {
    //   toast.info("Đã hoàn thành tất cả các bước");
    //   updateIsEndAlgorithm(true);
    //   setAnimateIsPause(true);
    //   updateStatusStepByStep(false);
    //   setStartResult(true);
    //   return;
    // }
    if (animationScript[currStep].action) {
      const currNodeId = animationScript[currStep].action.from;
      const nextNodeId = animationScript[currStep].action.to;
      const type = animationScript[currStep].action.type;

      visited = highLightPath(currNodeId!, nextNodeId!, visited, type!);
      setVisitedEdges(visited);
    }

    if ((currStep + 1) >= animationScript.length) {
      toast.success("Đã hoàn thành tất cả các bước");
      updateIsEndAlgorithm(true);
      setAnimateIsPause(true);
      updateStatusStepByStep(false);
      setStartResult(true);
      return;
    }

    updateStepbyStepInfo(animationScript[currStep]);
    setEulerAnimateStep(currStep + 1);
  }

  const prevStep = () => {
    const cy = cyInstanceRef.current;
    if (!cy || animationScript.length === 0 || eulerAnimateStep <= 0) return;
    // Remove highlight from current step

    let visited: string[] = [...visitedEdges];
    const prevStep = eulerAnimateStep - 2;

    if (animationScript[prevStep].action) {
      const currNodeId = animationScript[prevStep].action.from;
      const nextNodeId = animationScript[prevStep].action.to;

      visited = highLightPath(currNodeId!, nextNodeId!, visited, "unhighlight");
      setVisitedEdges(visited);

      if (eulerAnimateStep === animationScript.length) {
        cy.$id(nextNodeId!).removeClass("end");
      }
    }

    console.log("Check prev: ", eulerAnimateStep, ' - ', animationScript[prevStep]);
    updateStepbyStepInfo(animationScript[prevStep]);
    setEulerAnimateStep(prevStep + 1);

    if (eulerAnimateStep === currentEulerPath.length) {
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

    cy.elements().removeClass("AL-path euler-path end");

    // RESET STATE INNER HOOK
    setAnimateIsPause(true);
    setEulerAnimateStep(0);
    updateIsEndAlgorithm(false);
    setCurrentEulerPath([]);
    setVisitedEdges([]);

    // RESET DATA RESULT
    updateResult({ eulerCycle: [], stepInfo: [], sugMess: "", errMess: "", isCycle: true });
    handleChangeStart("");
    updateStepbyStepInfo(null);
    updateStatusStepByStep(false);
    setIsStep(false);
    startNodeRef.current = null;
  }

  const handlePlayAlgorithm = (stepByStep: boolean = false) => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    // RESET OLD DATA
    cy.elements().removeClass("AL-path euler-path end");

    setEulerAnimateStep(0);
    updateIsEndAlgorithm(false);
    setCurrentEulerPath([]);
    setVisitedEdges([]);
    setIsStep(false);

    if (stepByStep) {
      updateStatusStepByStep(true);
      setIsStep(true);
    }

    // RESET DATA RESULT
    updateResult({ eulerCycle: [], stepInfo: [], sugMess: "", errMess: "" });
    updateStepbyStepInfo(null);

    const needUpdateStart = !startNodeRef.current
    // MAIN
    const { step, eulerCycle } = findEulerPath(selectAlgorithm);

    if (suggestMess !== "") {
      return;
    } else if (eulerCycle.length === 0) {
      updateStatusStepByStep(false);
      return;
    }

    setResult(eulerCycle);
    setStartResult(false);
    // udpate start node if dont select start node before run algorithm
    if (needUpdateStart && startNodeRef.current) {
      handleChangeStart(startNodeRef.current.data("label"));
    }
    // RUN ANIMATE

    // Custom StepScript
    let configStep: stepInfo[] = step;
    if (!stepByStep) {
      let indexStepCustom = 1;
      configStep = step.reduce((acc, item) => {
        if (item.action != null) {
          acc.push({
            step: indexStepCustom++,
            action: { ...item.action },
          });
        }
        return acc;
      }, [] as stepInfo[]);
    }

    if (configStep && configStep.length === 0) return;

    setAnimationScript(configStep);
    handleRunAnimate(stepByStep, configStep);
    // test
  }

  useEffect(() => {
    const cy = cyInstanceRef.current
    if (startReult && result && cy) {
      cy.elements().removeClass("AL-path euler-path end");

      setIsDisplay(false);
      setEulerAnimateStep(0);
      if (!isStep) {
        updateIsEndAlgorithm(false);
      }
      setCurrentEulerPath([]);
      setVisitedEdges([]);

      updateStepbyStepInfo(null);

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
        handleRunAnimate(false, customResult, true, 300);
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