import React, { useCallback } from "react";
import type { Core, ElementDefinition } from "cytoscape";
import { useGraphStatusStore } from "../store/useGraphStatusStore";

interface UseGraphGenerationProps {
  cyInstance: React.RefObject<Core | null>;
  inputDataGraphRef: React.RefObject<HTMLTextAreaElement | null>
  isDirectedGraph: boolean;
  handleChangeStart: (value: string) => void;
}

const useGraphGeneration = ({
  cyInstance,
  inputDataGraphRef,
  isDirectedGraph,
  handleChangeStart,
}: UseGraphGenerationProps) => {
  const { handleLoadStatusFormFile, updateNodeDegree } = useGraphStatusStore();

  const handleGenerateGraph = useCallback(() => {
    const cy = cyInstance.current;
    const inputData = inputDataGraphRef.current;

    if (!cy || !inputData) {
      console.error("Cytoscape instance chưa sẵn sàng.");
      return;
    }

    cy.elements().remove();
    const lines = inputData.value.trim().split("\n");
    const elementsToAdd: ElementDefinition[] = [];
    const nodeLabels = new Set();

    lines.forEach((line) => {
      if (line.trim() === "") return;

      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const source = parts[0];
        const target = parts[1];

        nodeLabels.add(source);
        nodeLabels.add(target);

        elementsToAdd.push({
          group: "edges",
          data: {
            id: `e-${source}-${target}-${Math.random()}`,
            source: `n-${source}`,
            target: `n-${target}`,
          },
        });
      }
    });

    nodeLabels.forEach((label) => {
      elementsToAdd.push({
        group: "nodes",
        data: {
          id: `n-${label}`,
          label: label,
        },
      });
    });

    cy.add(elementsToAdd);
    const maxNode = Math.max(0, cy.nodes().length);
    const maxEdge = Math.max(0, cy.edges().length);
    handleLoadStatusFormFile(maxNode + 1, maxEdge + 1);

    cy.edges().forEach((edge) => {
      const sourceId = edge.data("source");
      const targetId = edge.data("target");

      const source = cy.$id(sourceId).data("label");
      const target = cy.$id(targetId).data("label");

      updateNodeDegree(source, target, isDirectedGraph);
    });

    handleChangeStart("");

    cy.layout({
      name: "cose",
      animate: true,
      idealEdgeLength: 100,
      nodeOverlap: 20,
      randomize: true,
    }).run();
  }, [cyInstance, handleLoadStatusFormFile, updateNodeDegree, isDirectedGraph, handleChangeStart]);

  return { handleGenerateGraph };
};

export default useGraphGeneration;
