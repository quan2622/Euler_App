import { useEffect } from "react";
import cytoscape, { type Core } from "cytoscape";
import { getCytoscapeStyle } from "../styles/graphStyle";
import { GraphService } from "../services/graphService";

export const useCytoscapeInstance = (
  cyRef: React.RefObject<HTMLDivElement | null>,
  cyInstanceRef: React.RefObject<Core | null>,
  isDirectedGraph: boolean
) => {
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cytoscape({
      container: cyRef.current,
      style: getCytoscapeStyle(isDirectedGraph),
      elements: [],
      layout: { name: 'grid', rows: 3, cols: 3 },
      minZoom: 0.7,
      maxZoom: 3,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: false,
      autounselectify: true,
      panningEnabled: true,
    });

    cyInstanceRef.current = cy;
    GraphService.handleLimitNodeOnScreen(cy, cyRef);

    return () => {
      cy.destroy();
    }
  }, [getCytoscapeStyle, cyRef, isDirectedGraph, cyInstanceRef]);
}