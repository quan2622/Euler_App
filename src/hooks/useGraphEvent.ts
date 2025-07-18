import { useCallback } from "react";
import type { Core, EdgeSingular } from "cytoscape";
import { GraphService } from "../services/graphService";
import type { MouseEventObject } from "../types/graph.type";

interface useGraphEventsProps {
  isDirectedGraph: boolean,
  nodeCounterRef: React.RefObject<number>,
  edgeCounterRef: React.RefObject<number>,
  startNodeRef: React.RefObject<EdgeSingular | null>,
  dragSourceNodeIdRef: React.RefObject<string | null>,
  tempTargetNodeIdRef: React.RefObject<string | null>,
  tempEdgeIdRef: React.RefObject<string | null>,
  newNodePositionRef: React.RefObject<{ x: number; y: number } | null>,
  onLableChange: (label: string) => void,
  toggleDialog: (value: boolean) => void
}

export const useGraphEvents = (
  { isDirectedGraph,
    nodeCounterRef,
    edgeCounterRef,
    startNodeRef,
    dragSourceNodeIdRef,
    tempTargetNodeIdRef,
    tempEdgeIdRef,
    newNodePositionRef,
    onLableChange,
    toggleDialog }: useGraphEventsProps
) => {
  const handleResetCache = useCallback((cy: Core) => {
    const tempIds = [tempEdgeIdRef.current, tempTargetNodeIdRef.current].filter((id) => id !== null);
    GraphService.clearTempElements(cy, tempIds)
    tempEdgeIdRef.current = null;
    tempTargetNodeIdRef.current = null;
    dragSourceNodeIdRef.current = null;
  }, []);

  const findNearbyNode = useCallback((cy: Core, mousePos: { x: number, y: number }) => {
    return cy.nodes().filter((node) => {
      const nodePos = node.position();
      const distance = Math.sqrt(Math.pow(mousePos.x - nodePos.x, 2) + Math.pow(mousePos.y - nodePos.y, 2));
      return distance < 25;
    });
  }, [])

  const addTempEdge = useCallback((cy: Core, sourceId: string, targetId: string, isValid: boolean) => {
    tempEdgeIdRef.current = `temp-edge-${Date.now()}`;
    cy.add({
      group: "edges",
      data: {
        id: tempEdgeIdRef.current,
        source: sourceId,
        target: targetId,
      },
      classes: "temp-edge",
      style: isValid ?
        {
          "line-color": "#2ECC40",
          "target-arrow-color": "#2ECC40",
          "target-arrow-shape": isDirectedGraph ? "triangle" : "solid",
          "line-style": "solid",
        }
        : {},
    })
  }, [isDirectedGraph]);

  const addTenmpNodeArrow = useCallback((cy: Core, mousePos: { x: number, y: number }, sourceId: string) => {
    tempTargetNodeIdRef.current = `temp-target-${Date.now()}`
    cy.add({
      group: "nodes",
      data: { id: tempTargetNodeIdRef.current },
      position: mousePos,
      classes: "temp-node"
    });

    addTempEdge(cy, sourceId, tempTargetNodeIdRef.current, false);
  }, [addTempEdge]);

  const handleMouseMove = useCallback((cy: Core, evt: MouseEventObject) => {
    const tempIds = [tempEdgeIdRef.current, tempTargetNodeIdRef.current].filter((id) => id !== null);
    GraphService.clearTempElements(cy, tempIds);

    const mousePos = evt.position || evt.cyPosition;
    const nodeNearby = findNearbyNode(cy, mousePos);
    if (nodeNearby.length > 0) {
      tempEdgeIdRef.current = `temp-edge-${Date.now()}`;
      addTempEdge(cy, dragSourceNodeIdRef.current!, nodeNearby[0].id(), true);
    } else {
      addTenmpNodeArrow(cy, mousePos, dragSourceNodeIdRef.current!)
    }
  }, [addTempEdge, addTenmpNodeArrow, dragSourceNodeIdRef, tempEdgeIdRef, tempTargetNodeIdRef]);

  // EVENT
  const handleEventListener = useCallback(
    (cy: Core) => {
      // Create new Node
      cy.on('dblclick', (evt) => {
        if (evt.target === cy) {
          newNodePositionRef.current = evt.position;
          onLableChange(`Node ${nodeCounterRef.current}`);
          toggleDialog(true);
        }
      })

      cy.on('dblclick', 'node', (evt) => {
        if (evt.target.isNode() && !evt.originalEvent.shiftKey) {
          if (startNodeRef.current) {
            cy.$id(startNodeRef.current.id()).removeClass('selected');
          }
          if (startNodeRef.current?.id() !== evt.target.id()) {
            startNodeRef.current = evt.target;
            cy.$id(evt.target.id()).addClass('selected');
          } else {
            startNodeRef.current = null;
          }
        }
      })

      // Start create Edge
      cy.on('mousedown', 'node', (evt) => {
        if (evt.originalEvent.shiftKey) {
          dragSourceNodeIdRef.current = evt.target.id();
          cy.autoungrabify(true);
          // cy.userPanningEnabled(false);
          evt.stopPropagation();
        }
      })

      cy.on('mousemove', (evt) => {
        if (evt.originalEvent.shiftKey && dragSourceNodeIdRef.current) {
          handleMouseMove(cy, evt);
        }
        if (!evt.originalEvent.shiftKey) {
          handleResetCache(cy);
        }

      })

      cy.on('mouseup', (evt) => {
        if (evt.originalEvent.shiftKey && dragSourceNodeIdRef.current) {
          const targetElement = evt.target;
          if (targetElement.isNode() && dragSourceNodeIdRef.current && targetElement.id()) {
            GraphService.addEdge(cy, dragSourceNodeIdRef.current, targetElement.id());
            edgeCounterRef.current += 1;
            handleResetCache(cy);

            dragSourceNodeIdRef.current = null;
          } else {
            handleResetCache(cy);
          }
        }
        cy.autoungrabify(false);
        // cy.userPanningEnabled(false);
      })
      // End create Edge

      // Out of Cavas
      cy.on('mouseout', (evt) => {
        if (evt.originalEvent.shiftKey && dragSourceNodeIdRef.current && evt.target === cy) {
          handleResetCache(cy);
        }
      })

      // interact with node
      cy.on('mouseover', 'node', (evt) => {
        if (!evt.originalEvent.shiftKey && !evt.target.hasClass('selected')) {
          evt.target.addClass("highlighted")
        }
      })

      cy.on("mouseout", "node", (evt) => {
        evt.target.removeClass("highlighted")
      })


    },
    [isDirectedGraph, handleMouseMove, handleResetCache]
  );

  return { handleEventListener };
}