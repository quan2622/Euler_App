import type { Core, NodeSingular } from "cytoscape"
import { useGraphStatusStore } from "../store/useGraphStatusStore"
import Algorithm from "../Algorithm/FindEulerPath";
import { toast } from "sonner";
import { ALGORITHM_SELECT, RUN_MODE } from "../utils/constant";
import { useGraphStore } from "../store/useGraphStore";
import type { EulerResult, stepInfo } from "../types/graph.type";

export const useAlgorithm = (
  cyInstanceRef: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>,
  isDirectedGraph: boolean,
) => {
  const { adjacencyList, interconnects, nodeDegrees, updateResult, updateStepbyStepInfo } = useGraphStatusStore();
  const { runMode, selectedElements, handleSetStartNode, updateOddNode, updateSuggestMess } = useGraphStore();

  const ValidateGraph = (steps: stepInfo[], stepsCounter: { count: number }): boolean => {
    // Start - Check interconnect component
    steps.push({
      step: stepsCounter.count++,
      description: "Kiểm tra thành phần liên thông",
    });

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
        updateResult({ errMess: "Các đỉnh có bậc >= 0 không thuộc cùng 1 thành phần liên thông" });
        steps.push({
          step: stepsCounter.count++,
          description: "Các đỉnh có bậc >= 0 không thuộc cùng 1 thành phần liên thông",
        });
        return false;
      }
    }
    // End - Check interconnect component

    // Start - Check even node degree
    steps.push({
      step: stepsCounter.count++,
      description: "Thành phần liên thông hợp lệ. Kiểm tra bậc của các đỉnh",
    });

    if (!checkEvenDegree()) {
      steps.push({
        step: stepsCounter.count++,
        description: "Bậc của các đỉnh không hợp lệ",
      });
      return false;
    }

    steps.push({
      step: stepsCounter.count++,
      description: "Bậc của các đỉnh hợp lệ",
    });
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
          toast.error(`Đồ thị tồn tại ${oddNode.length} đỉnh bậc lẻ: ${oddNode.join(" - ")}`);
          updateResult({ errMess: `Lỗi: Đồ thị tồn tại ${oddNode.length} đỉnh bậc lẻ: ${oddNode.join(" - ")}` });
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
            if (startNode) {
              toast.error(`Lỗi: Đồ thị có nhiều hơn một điểm bắt đầu ${startNode} và ${node}.`);
              updateResult({ errMess: `Lỗi: Đồ thị có nhiều hơn một điểm bắt đầu ${startNode} và ${node}.` });
              return false;
            }
            startNode = node;
          } else if (nodeDegrees[node].in - nodeDegrees[node].out === 1) {
            if (endNode) {
              toast.error(`Lỗi: Đồ thị có nhiều hơn một điểm kết thúc ${endNode} và ${node}.`);
              updateResult({ errMess: `Lỗi: Đồ thị có nhiều hơn một điểm kết thúc ${endNode} và ${node}.` });
              return false;
            }
            endNode = node;
          } else {
            toast.error(`Lỗi tại đỉnh ${node}: Chênh lệch giữa bậc ra và bậc vào không hợp lệ.`);
            updateResult({ errMess: `Lỗi tại đỉnh ${node}: Chênh lệch giữa bậc ra và bậc vào không hợp lệ.` });
            return false;
          }
        }
      }
      if (startNode && endNode) {
        updateOddNode([startNode, endNode]);
        toast.success(`Tìm thấy đường đi Euler. Bắt đầu từ ${startNode}, kết thúc tại ${endNode}.`);
        updateResult({ sugMess: `Tìm thấy đường đi Euler. Bắt đầu từ ${startNode}, kết thúc tại ${endNode}.` })
      }
    }

    return true;
  }

  const findEulerPath = (type: string): EulerResult => {
    const cy = cyInstanceRef.current;
    if (!cy) return { step: [], eulerCycle: [] };
    if (cy.nodes().length === 0 || cy.edges().length === 0) {
      toast.warning("Vui lòng nhập thông tin đồ thị trước khi chạy thuật toán");
      return { step: [], eulerCycle: [] };
    }

    const steps: stepInfo[] = [];
    const stepsCounter = { count: 1 };

    // Step 1: Validate Graph
    steps.push({
      step: stepsCounter.count++,
      description: "Kiểm tra thông tin đồ thị",
    });

    if (!ValidateGraph(steps, stepsCounter)) {
      steps.push({
        step: stepsCounter.count++,
        description: "Thông tin đồ thị không hợp lệ",
      });
      return { step: steps, eulerCycle: [] };
    }

    steps.push({
      step: stepsCounter.count++,
      description: "Thông tin đồ thị hợp lệ",
    });

    // Step 2: Check start node
    steps.push({
      step: stepsCounter.count++,
      description: "Kiểm tra đỉnh bắt đầu",
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
          const startNode = cy.$id(start);
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
      toast.warning("Vui lòng tạo cạnh và thử lại!");
      updateResult({ sugMess: `Đồ thị không tôn tại cạnh nối giữa 2 đỉnh với nhau. Vui lòng tạo cạnh và chạy lại thuật toán!` })
      return { step: [], eulerCycle: [] };
    } else {
      steps.push({
        step: stepsCounter.count++,
        description: `Đỉnh bắt đầu: ${cy.$id(start).data("label")}`,
      });
    }

    // let EC: string[] = [];

    let result: EulerResult = { step: [], eulerCycle: [] };

    if (type === ALGORITHM_SELECT.HIERHOLZER) {
      const { step, eulerCycle } = Algorithm.Hierholzer(cyInstanceRef, start, adjList, isDirectedGraph, stepsCounter.count);
      // EC = eulerCycle;

      result = { step: step, eulerCycle: eulerCycle };
    } else if (type === ALGORITHM_SELECT.FLEURY) {
      const { step, eulerCycle } = Algorithm.Fleury(cyInstanceRef, start, adjList, isDirectedGraph, stepsCounter.count);
      // EC = eulerCycle;

      result = { step: step, eulerCycle: eulerCycle };
    }

    // Merge steps
    result.step = [...steps, ...result.step];
    if (runMode === RUN_MODE.STEP) {
      updateStepbyStepInfo(result.step[0]);
    }

    updateResult({ eulerCycle: result.eulerCycle, stepInfo: result.step });

    return result;
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