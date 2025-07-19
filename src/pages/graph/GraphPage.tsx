import { useCallback, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import type { Core, EdgeSingular, EventObject, NodeSingular } from "cytoscape";
import cytoscape from "cytoscape";
import { toast } from "sonner";
import type { StylesheetCSS } from "cytoscape";
import type { GraphAnalysis } from "../../types/graph.type";


const GraphPage = () => {
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<Core | null>(null);
  // const [cy, setCy] = useState<Core | null>(null);
  const [isDirectedGraph, setIsDirectedGraph] = useState(true);
  const [currentLayout, setCurrentLayout] = useState("grid");


  // ===== STATE CHO DIALOG TẠO NODE MỚI =====
  const newNodePositionRef = useRef<{ x: number; y: number } | null>(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [labelNode, setLabelNode] = useState("");

  const [graphAnalysis, setGraphAnalysis] = useState<GraphAnalysis>({
    adjacencyMatrix: [],
    adjacencyList: {},
    nodeDegrees: {},
    nodeLabels: [],
  });

  const [selectedElements, setSelectedElements] = useState<string[]>([])

  const [selectedNode, setSelectedNode] = useState<NodeSingular | null>(null)

  const [selectedEdge, setSelectedEdge] = useState<EdgeSingular | null>(null)



  const [connectedComponents, setConnectedComponents] = useState<string[][]>([])

  // Ref theo dõi trạng thái phím Shift
  const isShiftPressedRef = useRef(false)

  // Ref lưu ID của node nguồn khi đang kéo để tạo edge
  const dragSourceNodeIdRef = useRef<string | null>(null)

  // Ref lưu ID của node tạm thời khi đang kéo
  const tempTargetNodeIdRef = useRef<string | null>(null)

  // Ref lưu ID của edge tạm thời khi đang kéo
  const tempEdgeIdRef = useRef<string | null>(null)

  // Refs đếm số lượng node và edge để tạo ID duy nhất
  const nodeCounterRef = useRef(1)
  const edgeCounterRef = useRef(1)

  const startNodeRef = useRef<EdgeSingular | null>(null);


  const getCytoscapeStyle = useCallback((isDirected: boolean): StylesheetCSS[] => [
    {
      selector: "node",
      css: {
        "background-color": "#3B82F6", // Màu nền xanh
        label: "data(label)", // Hiển thị label từ data
        color: "#FFFFFF", // Màu chữ trắng
        "text-valign": "center", // Căn giữa theo chiều dọc
        "text-halign": "center", // Căn giữa theo chiều ngang
        "font-size": 12,
        "font-weight": "bold",
        width: 40,
        height: 40,
        "border-width": 2,
        "border-color": "#1E40AF",
        "text-outline-width": 1,
        "text-outline-color": "#1E40AF",
        shape: "ellipse", // Hình tròn
      },
    },

    // Style cho edges
    {
      selector: "edge",
      css: {
        "line-color": "#6B7280",
        "target-arrow-color": "#6B7280",
        // Hiển thị mũi tên nếu là directed graph
        "target-arrow-shape": isDirected ? "triangle" : "none",
        "curve-style": "bezier", // Đường cong
        width: 2,
      },
    },

    // Style cho elements được chọn
    {
      selector: "node.selected",
      css: {
        // "background-color": "#EF4444", // Màu đỏ khi được chọn
        // "line-color": "#EF4444",
        // "target-arrow-color": "#EF4444",
        // "border-color": "#FCD34D", // Viền vàng
        "border-width": 3,
        "background-color": "#FFDC00",
        "border-color": "#FF851B",
      },
    },

    // Style cho nodes được highlight khi hover
    {
      selector: ".highlighted",
      css: {
        "background-color": "#10B981", // Màu xanh lá
        "border-color": "#059669",
        "border-width": "3px",
      },
    },

    // Style cho node tạm thời khi đang kéo
    {
      selector: ".temp-node",
      css: {
        "background-color": "transparent",
        "border-width": 0,
        opacity: 0,
        width: 1,
        height: 1,
        label: "",
        events: "no", // Không nhận events
      },
    },

    // Style cho edge tạm thời khi đang kéo
    {
      selector: ".temp-edge",
      css: {
        "line-color": "#F59E0B", // Màu cam
        "line-style": "dashed", // Đường đứt nét
        "target-arrow-color": "#F59E0B",
        "target-arrow-shape": isDirected ? "triangle" : "none",
        width: 3,
        opacity: 0.7,
        events: "no",
      },
    },

    // Style cho Euler path
    {
      selector: ".euler-path",
      css: {
        "line-color": "#DC2626", // Màu đỏ
        "target-arrow-color": "#DC2626",
        width: 4,
        "z-index": 10,
      },
    },

    // Style cho node hiện tại trong Euler path
    {
      selector: ".euler-current",
      css: {
        "background-color": "#DC2626", // Màu đỏ
        "border-color": "#FEF3C7",
        "border-width": 4,
        "z-index": 10,
      },
    },
  ], [])

  const handleEventListener = useCallback(
    (cy: Core) => {
      // Create new Node
      cy.on('dblclick', (evt) => {
        if (evt.target === cy) {
          newNodePositionRef.current = evt.position;
          setLabelNode(`Node ${nodeCounterRef.current}`);
          setIsOpenDialog(true);
        }
      })

      cy.on('dblclick', 'node', (evt) => {
        if (evt.target.isNode()) {
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

          cy.$(`#${tempEdgeIdRef.current}`).remove();
          cy.$(`#${tempTargetNodeIdRef.current}`).remove();

          const mousePos = evt.position || (evt as any).cyPosition;
          const nodeNear = cy.nodes().filter((node) => {
            // if (node.id() === dragSourceNodeIdRef.current) return false;
            const nodePos = node.position();
            const distance = Math.sqrt(Math.pow(mousePos.x - nodePos.x, 2) + Math.pow(mousePos.y - nodePos.y, 2));
            return distance < 25;
          })

          if (nodeNear.length > 0) {
            const targetNode = nodeNear[0];
            tempEdgeIdRef.current = `temp-edge-${Date.now()}`;
            cy.add({
              group: "edges",
              data: {
                id: tempEdgeIdRef.current,
                source: dragSourceNodeIdRef.current,
                target: targetNode.id(),
              },
              classes: "temp-edge",
              style: {
                "line-color": "#2ECC40",
                "target-arrow-color": "#2ECC40",
                "target-arrow-shape": "triangle",
                "line-style": "solid",
              },
            })
          } else {
            tempTargetNodeIdRef.current = `temp-target-${Date.now()}`
            cy.add({
              group: "nodes",
              data: { id: tempTargetNodeIdRef.current },
              position: mousePos,
              classes: "temp-node"
            });

            tempEdgeIdRef.current = `temp-edge-${Date.now()}`;
            cy.add({
              group: "edges",
              data: {
                id: tempEdgeIdRef.current,
                source: dragSourceNodeIdRef.current,
                target: tempTargetNodeIdRef.current,
              },
              classes: "temp-edge",
            });
          }
        }

        if (!evt.originalEvent.shiftKey) {
          handleResetCache(cy);
        }

      })

      cy.on('mouseup', (evt) => {
        if (evt.originalEvent.shiftKey && dragSourceNodeIdRef.current) {
          const targetElement = evt.target;
          if (targetElement.isNode() && dragSourceNodeIdRef.current && targetElement.id()) {
            addEdge(dragSourceNodeIdRef.current, targetElement.id());
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
    [])


  const addNode = useCallback((label: string, position: { x: number, y: number }) => {
    if (!cyInstance.current) return;

    const id = `node-${Date.now()}`;
    cyInstance.current.add({
      group: "nodes",
      data: { id: id, label: label },
      position: position,
    })
  }, []);

  const addEdge = useCallback((sourceId: string, targetId: string) => {
    if (!cyInstance.current) return;

    const id = `${sourceId}-${targetId}-${Date.now()}`;
    cyInstance.current.add({
      group: "edges",
      data: {
        id: id,
        source: sourceId,
        target: targetId,
        order: ""
      }
    });
  }, []);


  // Handle Fuction
  const handleCreateNewNode = () => {
    if (cyInstance.current && newNodePositionRef.current && labelNode.trim() !== "") {
      addNode(labelNode.trim(), newNodePositionRef.current);
      nodeCounterRef.current += 1;

      setLabelNode("");
      newNodePositionRef.current = null;
      setIsOpenDialog(false);
    } else if (labelNode.trim() === "") {
      toast.error("Tên của Node không được bỏ trống.")
    }
  }

  const handleResetCache = (cy: Core) => {
    if (tempEdgeIdRef.current) {
      cy.$id(tempEdgeIdRef.current)?.remove();
      tempEdgeIdRef.current = null;
    }
    if (tempTargetNodeIdRef.current) {
      cy.$id(tempTargetNodeIdRef.current)?.remove();
      tempTargetNodeIdRef.current = null;
    }
    if (dragSourceNodeIdRef.current) {
      dragSourceNodeIdRef.current = null;
    }
  }

  const handleLimitNodeOnScreen = useCallback(
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
    }, [])

  // handle analystic


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

    cyInstance.current = cy;
    handleLimitNodeOnScreen(cy, cyRef);

    handleEventListener(cy);

    return () => {
      cy.destroy();
    }
  }, [getCytoscapeStyle, handleLimitNodeOnScreen, handleEventListener, cyRef, isDirectedGraph]);


  return (
    <>
      <div className="flex h-screen bg-zinc-500">
        <div className="flex-1 flex flex-col">
          <div className="h-60 w-full border-red-600 border-2">
            toolbars
            <Button variant={'outline'} onClick={() => setIsDirectedGraph(prev => !prev)}>{isDirectedGraph ? "Có hướng" : "Vô hướng"}</Button>
          </div>

          {/* Graph Container */}
          <div className="flex-1 relative">
            <div
              ref={cyRef}
              className="w-full h-full overflow-hidden bg-white"
            />
          </div>
        </div>
        <div className="w-96 border-blue-600 border-2">

        </div>
      </div>
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Create New Node</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="node-label-input" className="text-right"> Label </Label>
              <Input
                id="node-label-input"
                value={labelNode}
                onChange={(e) => setLabelNode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewNode()
                  }
                }}
                className="col-span-3"
                placeholder="Enter node name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNewNode}>Add Node</Button>
          </DialogFooter>
        </DialogContent>

      </Dialog >

    </>
  )
}
export default GraphPage