import { useCallback } from "react";
import type { Core, EdgeSingular, NodeSingular } from "cytoscape";
import { toast } from "sonner";
import { useGraphStatusStore } from "../store/useGraphStatusStore";
import { useGraphStore } from "../store/useGraphStore";
import { GraphService } from "../services/graphService";

interface UseGraphElementManagementProps {
  cyInstance: React.RefObject<Core | null>;
  isDirectedGraph: boolean;
  startNodeRef: React.RefObject<NodeSingular | null>;
}

const useGraphElementManagement = ({
  cyInstance,
  isDirectedGraph,
  startNodeRef,
}: UseGraphElementManagementProps) => {
  const { selectedElements, handleResetSelectedElement } = useGraphStore();
  const { updateNodeDegree, handleResetStatus, updateResult, nodeDegrees } = useGraphStatusStore();

  const connectSelection = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const selectors = selectedElements.map((id) => `#${id}`).join(",");
    const selectedNodes = cy.elements(selectors).nodes();

    if (selectedNodes.length === 2) {
      const sourceNode = selectedNodes[0];
      const targetNode = selectedNodes[1];

      GraphService.addEdge(cy, sourceNode.id(), targetNode.id());

      updateNodeDegree(sourceNode.data("label"), targetNode.data("label"), isDirectedGraph);

      handleResetSelectedElement();
      cy.nodes().removeClass("hasSelected");
    } else {
      toast.warning("Vui lòng chỉ chọn 2 nút để tạo liên kết");
    }
  }, [selectedElements, cyInstance, updateNodeDegree, handleResetSelectedElement, isDirectedGraph]);

  const handleDeleteElement = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const elementIds = new Set(selectedElements);
    const selectedNodes = cy.nodes().filter((node) => elementIds.has(node.id()));
    const selectedEdges = cy.edges().filter((edge) => elementIds.has(edge.id()));

    if (selectedNodes && selectedNodes.length > 0) {
      let cloneNodeDegree = Object.fromEntries(
        Object.entries(nodeDegrees).map(([k, v]) => [k, { ...v }])
      );

      const selectedNodeLabel = new Set(selectedNodes.map((item) => item.data("label")));

      cloneNodeDegree = Object.fromEntries(
        Object.entries(cloneNodeDegree).filter(([key]) => !selectedNodeLabel.has(key))
      );
      useGraphStatusStore.setState({ nodeDegrees: cloneNodeDegree });

      selectedNodes.forEach((node) => {
        const connectedEdges = node.connectedEdges();

        if (connectedEdges.length > 0) {
          connectedEdges.forEach((edge) => {
            const source = edge.source();
            const target = edge.target();

            if (!(elementIds.has(source.id()) && elementIds.has(target.id()))) {
              edge.remove();
              updateNodeDegree(source.data("label"), target.data("label"), isDirectedGraph, false);
            }
          });
        }
      });

      selectedNodes.remove();
    }

    if (selectedEdges && selectedEdges.length > 0) {
      selectedEdges.forEach((edge: EdgeSingular) => {
        const source = edge.source().data("label");
        const target = edge.target().data("label");
        updateNodeDegree(source, target, isDirectedGraph, false);
      });
      selectedEdges.remove();
    }

    handleResetSelectedElement();
  }, [selectedElements, cyInstance, nodeDegrees, updateNodeDegree, handleResetSelectedElement, isDirectedGraph]);

  const clearGraph = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    cy.elements().remove();
    handleResetSelectedElement();
    handleResetStatus();
    updateResult({ stepInfo: [], eulerCycle: [], errMess: "", sugMess: "", isCycle: true });
    startNodeRef.current = null;
  }, [cyInstance, handleResetSelectedElement, handleResetStatus, updateResult, startNodeRef]);

  return {
    connectSelection,
    handleDeleteElement,
    clearGraph
  };
};

export default useGraphElementManagement;
