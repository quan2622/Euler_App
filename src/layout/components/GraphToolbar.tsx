/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Core, EdgeSingular, NodeSingular } from "cytoscape"
import { Button } from "../../components/ui/button"
import { useCallback, useRef, useState } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { GraphService } from "../../services/graphService";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Eraser, FileDown, FileUp, Fullscreen, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useGraphStatusStore } from "../../store/useGraphStatusStore";
import { Input } from "../../components/ui/input";

interface GraphToolbarProps {
  cyInstance: React.RefObject<Core | null>,
  isDirectedGraph: boolean,
  startNodeRef: React.RefObject<NodeSingular | null>
  onToggleDirected: (type?: boolean) => void,
}

const GraphToolbar = ({
  cyInstance,
  isDirectedGraph,
  startNodeRef,
  onToggleDirected
}: GraphToolbarProps) => {

  const { selectedElements, handleResetSelectedElement, startNode, handleSetStartNode } = useGraphStore();
  const { updateNodeDegree, handleResetStatus, handleLoadStatusFormFile, nodeLabels } = useGraphStatusStore();
  const [currentLayout, setCurrentLayout] = useState("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== ZOOM AND PAN CONTROLS =====
  const zoomIn = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 1.2)
  const zoomOut = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 0.8)
  const fitToScreen = () => cyInstance.current?.fit()
  const center = () => cyInstance.current?.center()

  const handleChangeLayout = useCallback((layout: string) => {
    const cy = cyInstance.current

    if (!cy) return;
    const layoutOptions: any = {
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
    }

    cy.layout(layoutOptions[layout] || layoutOptions.grid).run()
    setCurrentLayout(layout);
  }, []);

  const connectSelection = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const selectors = selectedElements.map(id => `#${id}`).join(",");
    const selectedNodes = cy.elements(selectors).nodes();

    if (selectedNodes.length === 2) {
      const sourceNode = selectedNodes[0];
      const targetNode = selectedNodes[1];


      GraphService.addEdge(cy, sourceNode.id(), targetNode.id());
      updateNodeDegree(sourceNode.id(), targetNode.id(), isDirectedGraph);
      cy.nodes().removeClass("hasSelected");
      handleResetSelectedElement();
    } else {
      toast.warning("Vui lòng chỉ chọn 2 nút để tạo liên kết");
    }
  }, [selectedElements, cyInstance]);

  const handleDeleteElement = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const nodeIds = new Set(selectedElements);
    const selectedNodes = cy.nodes().filter(node => nodeIds.has(node.id()));

    selectedNodes.forEach(node => {
      const connectedEdges = node.connectedEdges();
      connectedEdges.forEach(edge => {
        const sourceId = edge.source().id();
        const targetId = edge.target().id();

        if (!(nodeIds.has(sourceId) && nodeIds.has(targetId))) {
          edge.remove();
          updateNodeDegree(sourceId, targetId, isDirectedGraph, false);
        }

      });
    });
    selectedNodes.remove();
  }, [isDirectedGraph, selectedElements]);

  const clearGraph = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    cy.elements().remove();
    handleResetSelectedElement();
    handleResetStatus();
  }, [handleResetSelectedElement, handleResetStatus]);

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
        version: "1.0.0"
      }
    }

    const jsonString = JSON.stringify(graphData, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [isDirectedGraph, currentLayout]);

  const importGraph = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const cy = cyInstance.current;
    if (!cy) return;
    const file = evt.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const graphData = JSON.parse(e.target?.result as string);

          cy.elements().remove();

          if (graphData.nodes) {
            graphData.nodes.forEach((node: any) => {
              cy.add({
                group: "nodes",
                data: node.data,
                position: node.position || { x: 0, y: 0 }
              })
            });
          }

          if (graphData.edges) {
            graphData.edges.forEach((edge: any) => {
              cy.add({
                group: "edges",
                data: edge.data,
              })
            });
          }

          if (graphData.settings) {
            if (typeof graphData.settings.isDirectedGraph === "boolean") {
              onToggleDirected(graphData.settings.isDirectedGraph)
            }
            if (graphData.settings.currentLayout) {
              setCurrentLayout(graphData.settings.currentLayout)
            }

            setTimeout(() => {
              if (graphData.settings.zoom) {
                cy.zoom(graphData.settings.zoom)
              }
              if (graphData.settings.pan) {
                cy.pan(graphData.settings.pan)
              }
            }, 200)
          }

          const hasPositions = graphData.nodes &&
            graphData.nodes.some((node: any) => node.position && (node.position.x !== 0 || node.position.y !== 0));

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
      }
      reader.readAsText(file);
    }
    if (evt.target && evt.target.value) {
      evt.target.value = "";
    }
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleChangStart = (value: string) => {
    handleSetStartNode(value);

    const nodes = cyInstance.current?.nodes();
    const startNode = nodes?.filter((node) => node.data("label") === value).first();
    if (startNode?.nonempty() && startNode.isNode()) {
      startNodeRef.current = startNode;
    }
  }

  return (
    <div className="h-60 w-full border-red-600 border-2">
      toolbars
      <Button variant={'outline'} onClick={() => onToggleDirected()}>{isDirectedGraph ? "Có hướng" : "Vô hướng"}</Button>
      <Button variant={"destructive"} onClick={connectSelection}>Tạo liên kết</Button>
      <Select value={currentLayout} onValueChange={handleChangeLayout}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Chọn Layout" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Chọn layout</SelectLabel>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="cose">Force</SelectItem>
            <SelectItem value="breadthfirst">Hierarchy</SelectItem>
            <SelectItem value="concentric">Concentric</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex gap-2 my-2">
        <Button variant={"outline"} size={"icon"} onClick={zoomIn}><ZoomIn /></Button>
        <Button variant={"outline"} size={"icon"} onClick={zoomOut}><ZoomOut /> </Button>
        <Button variant={"outline"} size={"icon"} onClick={fitToScreen}><Fullscreen /> </Button>
        <Button variant={"outline"} size={"icon"} onClick={center}><Shrink /> </Button>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={handleDeleteElement}><Eraser /> Xóa phần tử </Button>
        <Button variant={"outline"} onClick={clearGraph}><Trash2 /> Xóa đồ thị </Button>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={exportGraph}><FileDown />Xuất đồ thị</Button>
        <Button variant={"outline"} onClick={handleUploadClick}><FileUp /> Tải lên đồ thị </Button>
        <Input className="hidden" type="file" accept=".json" ref={fileInputRef} onChange={importGraph} />
      </div>

      <Select value={startNode} onValueChange={handleChangStart}>
        <SelectTrigger className="w-[180px] bg-pink-200">
          <SelectValue placeholder="Chọn đỉnh bắt đầu" />
        </SelectTrigger>
        <SelectContent>
          {nodeLabels && nodeLabels.length > 0 && nodeLabels.map((label, index) => (
            <SelectItem value={label} key={index}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
export default GraphToolbar