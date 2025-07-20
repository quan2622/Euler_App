import type { Core, EventObject } from "cytoscape";
import type { NodePosition } from "../types/graph.type";

export class GraphService {

  static addNode = (cy: Core, label: string, position: NodePosition, nodeId: string) => {
    cy.add({
      group: "nodes",
      data: { id: nodeId, label: label },
      position: position,
    })
  };

  static addEdge = (cy: Core, sourceId: string, targetId: string) => {
    const id = `${sourceId}-${targetId}-${Date.now()}`;
    cy.add({
      group: "edges",
      data: {
        id: id,
        source: sourceId,
        target: targetId,
        order: ""
      }
    });
  };

  static removeElement(cy: Core, id: string): void {
    cy.$id(id)?.remove();
  }

  static clearTempElements(cy: Core, tempIds: string[]): void {
    tempIds.forEach(id => {
      if (id) {
        // cy.$id(id)?.remove();
        cy.$(`#${id}`).remove();
      }
    });
  }

  static handleLimitNodeOnScreen =
    (cy: Core, containerRef: React.RefObject<HTMLDivElement | null>) => {
      cy.on('drag', 'node', (evt: EventObject) => {
        if (!containerRef.current) return;

        const node = evt.target;
        const position = node.position();

        const canvasSize = containerRef.current.getBoundingClientRect();
        const zoom = cy.zoom();
        const pan = cy.pan();
        const padding = 30;
        const minX = (-pan.x + padding) / zoom;
        const maxX = (canvasSize.width - pan.x - padding) / zoom;
        const minY = (-pan.y + padding) / zoom;
        const maxY = (canvasSize.height - pan.y - padding) / zoom;

        const newPos = {
          x: Math.max(minX, Math.min(maxX, position.x)),
          y: Math.max(minY, Math.min(maxY, position.y))
        };

        if (newPos.x !== position.x || newPos.y !== position.y) {
          node.position(newPos);
        }
      });
    }

}