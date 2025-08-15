import { useCallback } from "react";
import type { Core, NodeSingular, EdgeSingular } from "cytoscape";
import { toast } from "sonner";
import { useGraphStatusStore } from "../store/useGraphStatusStore";

interface UseGraphImportExportProps {
  cyInstance: React.RefObject<Core | null>;
  isDirectedGraph: boolean;
  currentLayout: string;
  setCurrentLayout: (layout: string) => void;
  onToggleDirected: (type?: boolean) => void;
  handleLoadStatusFormFile: (maxNode: number, maxEdge: number) => void;
}

const useGraphImportExport = ({
  cyInstance,
  isDirectedGraph,
  currentLayout,
  setCurrentLayout,
  onToggleDirected,
  handleLoadStatusFormFile,
}: UseGraphImportExportProps) => {

  const { updateNodeDegree, initDegreeForNode } = useGraphStatusStore();

  const exportGraph = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const graphData = {
      nodes: cy.nodes().map((node: NodeSingular) => ({
        data: node.data(),
        position: node.position(),
      })),
      edges: cy.edges().map((edge: EdgeSingular) => ({
        data: edge.data(),
      })),
      settings: {
        isDirectedGraph,
        currentLayout,
        zoom: cy.zoom(),
        pan: cy.pan(),
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      },
    };

    const jsonString = JSON.stringify(graphData, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" }); //gắn loại MIME -> file JSON

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }, [cyInstance, isDirectedGraph, currentLayout]);

  const importGraph = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const cy = cyInstance.current;
    if (!cy) return;
    const file = evt.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          cy.elements().remove();

          const graphData = JSON.parse(e.target?.result as string);
          if (graphData.nodes) {
            graphData.nodes.forEach((node: { data: Record<string, unknown>; position?: { x: number; y: number } }) => {
              cy.add({
                group: "nodes",
                data: node.data,
                position: node.position || { x: 0, y: 0 },
              });
            });

            // HANDLE INIT NODE DEGREE
            cy.nodes().forEach((node) => {
              initDegreeForNode(node.data("label"))
            });
          }



          if (graphData.edges) {
            graphData.edges.forEach((edge: { data: Record<string, unknown> }) => {
              cy.add({
                group: "edges",
                data: edge.data,
              });
            });

            // HANDLE UPDATE NODE DEGREE
            cy.edges().forEach((edge) => {
              const sourceId = edge.data("source");
              const targetId = edge.data("target");

              const source = cy.$id(sourceId).data("label");
              const target = cy.$id(targetId).data("label");

              updateNodeDegree(source, target, isDirectedGraph);
            });
          }

          if (graphData.settings) {
            if (typeof graphData.settings.isDirectedGraph === "boolean") {
              onToggleDirected(graphData.settings.isDirectedGraph);
            }
            if (graphData.settings.currentLayout) {
              setCurrentLayout(graphData.settings.currentLayout);
            }

            setTimeout(() => {
              if (graphData.settings.zoom) {
                cy.zoom(graphData.settings.zoom);
              }
              if (graphData.settings.pan) {
                cy.pan(graphData.settings.pan);
              }
            }, 200);
          }

          const hasPositions =
            graphData.nodes &&
            graphData.nodes.some(
              (node: { position?: { x: number; y: number } }) => node.position && (node.position.x !== 0 || node.position.y !== 0)
            );

          if (!hasPositions) {
            cy.layout({ name: "grid" }).run();
          }

          const maxNode = Math.max(0, cy.nodes().length);
          const maxEdge = Math.max(0, cy.edges().length);
          handleLoadStatusFormFile(maxNode + 1, maxEdge + 1);
        } catch (error) {
          console.log("Error importing graph: ", error);
          toast.error("Lỗi không thể tải đồ thị lên. Vui lòng kiểm tra lại file!");
        }
      };
      reader.readAsText(file);
    }
    if (evt.target && evt.target.value) {
      evt.target.value = "";
    }
  }, []);

  return {
    exportGraph,
    importGraph
  };
};

export default useGraphImportExport;
