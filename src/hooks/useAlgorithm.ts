import type { Core, NodeSingular } from "cytoscape"
import { useGraphStatusStore } from "../store/useGraphStatusStore"
import Algorithm from "../Algorithm/FindEulerPath";
import { toast } from "sonner";
import { ALGORITHM_SELECT } from "../utils/constant";
import { useGraphStore } from "../store/useGraphStore";
import type { stepInfo } from "../types/graph.type";

export const useAlgorithm = (
  cyInstanceRef: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>,
  isDirectedGraph: boolean,
) => {
  const { adjacencyList, interconnects, nodeDegrees, updateResult } = useGraphStatusStore();
  const { selectedElements, handleSetStartNode, updateOddNode, updateSuggestMess } = useGraphStore();


  const ValidateGraph = (): boolean => {
    // Start - Check interconnect component
    const numberOfComponent = interconnects.length;

    let flag = 0;
    if (numberOfComponent > 1) {
      for (const component of interconnects) {
        for (const node of component) {
          if (nodeDegrees[node].total > 0) {
            flag += 1;
            break;
          }
        }
      }
      if (flag > 1) {
        toast.error("Các đỉnh có bậc >= 0 không thuộc cùng 1 thành phần liên thông");
        updateResult({ errMess: "Các đỉnh có bậc >= 0 không thuộc cùng 1 thành phần liên thông" })
        return false;
      }
    }
    // End - Check interconnect component

    // Start - Check even node degree
    if (!checkEvenDegree()) {
      return false;
    }
    // End - Check even node degree

    return true;
  }

  const checkEvenDegree = () => {
    if (!isDirectedGraph) {
      const oddNode: string[] = [];
      updateResult({ isCycle: true });

      for (const node in nodeDegrees) {
        if (nodeDegrees[node].total % 2 !== 0) {
          oddNode.push(node);
        }
      }
      if (oddNode.length > 0)
        if (oddNode.length !== 2) {
          toast.error(`Đồ thị tồn tại ${oddNode.length} đỉnh bậc lẻ`);
          updateResult({ errMess: `Đồ thị tồn tại ${oddNode.length} đỉnh bậc lẻ` });
          return false;
        } else {
          updateResult({ isCycle: false });
          if (!oddNode.includes(startNodeRef.current?.data("label"))) {
            updateSuggestMess(`Đồ thị có 2 đỉnh bậc lẻ. Nên chọn ${oddNode.join(" hoặc ")} làm đỉnh bắt đầu`)
            updateResult({ sugMess: `Đồ thị có 2 đỉnh bậc lẻ. Nên chọn ${oddNode.join(" hoặc ")} làm đỉnh bắt đầu` })
            updateOddNode(oddNode);
            return false;
          }
        }
    }
    else {
      let startNode: string | null = null;
      let endNode: string | null = null;
      for (const node in nodeDegrees) {
        if (nodeDegrees[node].in !== nodeDegrees[node].out) {
          if (nodeDegrees[node].out - nodeDegrees[node].in === 1) {
            if (startNode) return false;
            startNode = node;
          } else if (nodeDegrees[node].in - nodeDegrees[node].out === 1) {
            if (endNode) return false;
            endNode = node;
          } else
            return false;
        }
      }
      if (startNode && endNode)
        updateOddNode([startNode, endNode]);
    }

    return true;
  }

  const findEulerPath = (type: string): string[] => {
    const cy = cyInstanceRef.current;
    if (!cy) return [];

    const steps: stepInfo[] = [];
    const stepsCounter = { count: 1 };

    if (!ValidateGraph()) return [];

    steps.push({
      step: stepsCounter.count++,
      description: `Kiểm tra thông tin đồ thị: ✓`,
    });

    const adjList = Object.fromEntries(
      Object.entries(adjacencyList).map(([k, v]) => [k, [...v]])
    );

    let start = startNodeRef.current?.id();
    if (!start) {
      for (const key of Object.keys(adjList)) {
        if (adjList[key].length > 0) {
          start = key;

          const nodes = cy.nodes();
          nodes.removeClass("start");
          const startNode = cy.$id(start)
          startNode.addClass("start");

          if (startNode.nonempty() && startNode.isNode()) {
            startNodeRef.current = startNode;
          }

          toast.warning(`Tự động chọn đỉnh ${startNode.data("label")} làm đỉnh bắt đầu`);
          break;
        }
      }
    }
    if (!start) {
      toast.warning("Vui lòng chọn đỉnh bắt đầu!")
      return [];
    } else {
      steps.push({
        step: stepsCounter.count++,
        description: `Đỉnh bắt đầu: ${start}`,
      });
    }

    let EC: string[] = [];

    if (type === ALGORITHM_SELECT.HIERHOLZER) {
      const { step, eulerCycle } = Algorithm.Hierholzer(cyInstanceRef, start, adjList, isDirectedGraph);
      updateResult({ eulerCycle: eulerCycle, stepInfo: step });
      EC = eulerCycle;
    } else if (type === ALGORITHM_SELECT.FLEURY) {
      const { step, eulerCycle } = Algorithm.Fleury(cyInstanceRef, start, adjList, isDirectedGraph);
      updateResult({ eulerCycle: eulerCycle, stepInfo: step });
      EC = eulerCycle;
    }
    return EC;
  }

  const handleChangeStart = (value: string) => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    const elementIds = new Set(selectedElements);
    const selectedNodes = cy.nodes().filter(node => elementIds.has(node.id()));
    const selectedNodeLabel = selectedNodes.map(item => item.data("label"));

    if (selectedNodeLabel.includes(value)) {
      toast.warning("Không thể chọn đỉnh bị đánh dấu!")
      return;
    }

    // Update start node in store
    handleSetStartNode(value);
    // Reset status find Euler
    updateOddNode([]);
    updateSuggestMess("");
    updateResult({ sugMess: "" });
    // Check even node degree

    const nodes = cy.nodes();
    nodes.removeClass("start");
    const startNode = nodes?.filter((node) => node.data("label") === value).first();

    if (startNode) {
      startNode.addClass("start");
      if (startNode.nonempty() && startNode.isNode()) {
        startNodeRef.current = startNode;
      }
    }
  }

  return {
    findEulerPath,
    handleChangeStart,
  }
}