import { useCallback, useEffect, useRef } from "react";
import type { Core, NodeSingular } from "cytoscape";
import { GraphService } from "../services/graphService";
import type { MouseEventObject, NodePosition } from "../types/graph.type";
import { useGraphStore } from "../store/useGraphStore";
import { useGraphStatusStore } from "../store/useGraphStatusStore";
import { toast } from "sonner";

interface useGraphEventsProps {
  isDirectedGraph: boolean,
  startNodeRef: React.RefObject<NodeSingular | null>,
  dragSourceNodeIdRef: React.RefObject<string | null>,
  tempTargetNodeIdRef: React.RefObject<string | null>,
  tempEdgeIdRef: React.RefObject<string | null>,
  openNodeCreationDialog: (position: NodePosition) => void
}

export const useGraphEvents = (
  { isDirectedGraph,
    startNodeRef,
    dragSourceNodeIdRef,
    tempTargetNodeIdRef,
    tempEdgeIdRef,
    openNodeCreationDialog
  }: useGraphEventsProps
) => {


  const { selectedElements, handleSetStartNode, handleAddSelectedElements, handleRemoveSelectedElements } = useGraphStore();
  const { updateNodeDegree } = useGraphStatusStore();

  // update selected elements
  const selectedElementsRef = useRef<string[]>(selectedElements);
  useEffect(() => {
    selectedElementsRef.current = selectedElements;
  }, [selectedElements]);


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
      classes: isValid ? "temp-edge-target" : "temp-edge",
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

  // HANDLE PROCESS EVENT MOUSE MOVE
  const handleMouseMove = useCallback((cy: Core, evt: MouseEventObject) => {
    // Xóa những node và edge ở vị trí cũ
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
          openNodeCreationDialog(evt.position);
        }
      })

      cy.on('dblclick', 'node', (evt) => {
        if (evt.target.isNode() && evt.originalEvent.altKey) {
          if (cy.$id(evt.target.id()).hasClass('hasSelected')) {
            toast.warning("Không thể chọn đỉnh bị đánh dấu!")
            return;
          }
          if (!startNodeRef.current) {
            startNodeRef.current = evt.target;
            cy.$id(evt.target.id()).addClass('start');
            handleSetStartNode(cy.$id(evt.target.id()).data("label"));
          } else {
            if (startNodeRef.current?.id() !== evt.target.id()) {
              cy.nodes().removeClass("start");
              startNodeRef.current = evt.target;
              cy.$id(evt.target.id()).addClass('start');
              handleSetStartNode(cy.$id(evt.target.id()).data("label"));
            } else {
              cy.$id(startNodeRef.current.id()).removeClass('start');
              startNodeRef.current = null;
              handleSetStartNode("");
            }
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
            // handle update node degree
            const dragSourceNodeLabel = cy.$id(dragSourceNodeIdRef.current).data("label");

            updateNodeDegree(dragSourceNodeLabel, targetElement.data("label"), isDirectedGraph);
            // handle update node degree

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

      // select element
      cy.on("tap", (evt) => {
        const element = evt.target;
        if (element !== cy && evt.originalEvent.ctrlKey) {
          if (element.isNode()) {
            if (element.data('label') === startNodeRef.current?.data("label")) {
              return;
            }
          }
          if (!selectedElementsRef.current.includes(element.id())) {
            element.addClass("hasSelected");
            handleAddSelectedElements(element.id());
          } else {
            element.removeClass("hasSelected");
            handleRemoveSelectedElements(element.id());
          }
        }
      })
    },
    [isDirectedGraph, handleMouseMove, handleResetCache, openNodeCreationDialog, handleAddSelectedElements, handleRemoveSelectedElements, handleSetStartNode]
  );

  return { handleEventListener };
}