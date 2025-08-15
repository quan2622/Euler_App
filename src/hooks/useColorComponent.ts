import type { Core } from "cytoscape";
import React, { useCallback } from "react";
import { getRandomColor } from "../utils/randomColors";
import { getCytoscapeStyle } from "../styles/graphStyle";
import { useGraphStatusStore } from "../store/useGraphStatusStore";

interface useColorComponentProps {
  cyInstanceRef: React.RefObject<Core | null>;
  isDirectedGraph: boolean;
}

const useColorComponent = ({ cyInstanceRef, isDirectedGraph }: useColorComponentProps) => {
  const { interconnects } = useGraphStatusStore();

  const colorConnectedComponents = useCallback(() => {
    const cy = cyInstanceRef.current;
    const numberOfComponents = interconnects.length;

    if (!cy || !numberOfComponents) return;


    const componentColors: { [key: number]: string } = {};
    for (let i = 0; i < numberOfComponents; i++) {
      componentColors[i] = getRandomColor();
    }

    cy.style()
      .selector('node')
      .style({
        'background-color': (node) => componentColors[node.data('component_id')],
      })
      .selector('edge')
      .style({
        'line-color': (edge) => componentColors[edge.data('component_id')]
      })
      .update();
  }, [interconnects]);


  const resetColors = useCallback(() => {
    const cy = cyInstanceRef.current;
    if (!cy) return;

    cy.style(getCytoscapeStyle(isDirectedGraph))
  }, []);


  return {
    colorConnectedComponents,
    resetColors,
  }
}

export default useColorComponent;