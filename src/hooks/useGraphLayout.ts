import { useCallback } from "react";
import type { Core, NodeSingular, LayoutOptions } from "cytoscape";
import { useGraphStore } from "../store/useGraphStore";

interface UseGraphLayoutProps {
  cyInstance: React.RefObject<Core | null>;
}

const useGraphLayout = ({ cyInstance }: UseGraphLayoutProps) => {
  const { updateLayoutGraph } = useGraphStore();

  const handleChangeLayout = useCallback((layout: string) => {
    const cy = cyInstance.current;

    if (!cy) return;
    updateLayoutGraph(layout);

    const layoutOptions: Record<string, LayoutOptions> = {
      grid: { name: "grid", rows: 6, cols: 6 },
      circle: { name: "circle", radius: 200 },
      cose: {
        name: "cose",
        nodeRepulsion: 10000,
        edgeElasticity: 100,
        gravity: 80,
        numIter: 1000,
      },
      breadthfirst: {
        name: "breadthfirst",
        directed: true,
        spacingFactor: 1.5,
      },
      concentric: {
        name: "concentric",
        concentric: (node: NodeSingular) => node.degree(),
        levelWidth: () => 1,
      },
    };

    cy.layout(layoutOptions[layout] || layoutOptions.grid).run();
  }, [cyInstance, updateLayoutGraph]);

  return { handleChangeLayout };
};

export default useGraphLayout;
