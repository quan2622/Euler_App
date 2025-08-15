/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Core, EdgeSingular, NodeSingular } from "cytoscape"
import { Button } from "../../components/ui/button"
import React, { useCallback, useRef, useState } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { GraphService } from "../../services/graphService";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Eraser, FileDown, FileUp, Fullscreen, Pause, PencilRuler, Play, RotateCcw, Scaling, Shrink, SkipBack, SkipForward, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useGraphStatusStore } from "../../store/useGraphStatusStore";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { RUN_MODE } from "../../utils/constant";
import { ScrollArea } from "../../components/ui/scroll-area";
import type { ElementDefinition } from "cytoscape";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import Output from "./ToolbarContent/OutputComponent/Output";
import InputToolbar from "./ToolbarContent/InputComponent/InputToolbar";

interface GraphToolbarProps {
  cyInstance: React.RefObject<Core | null>,
  startNodeRef: React.RefObject<NodeSingular | null>
  isDirectedGraph: boolean,
  animateIsPause: boolean,

  onToggleDirected: (type?: boolean) => void,
  nextStep: () => void,
  prevStep: () => void,
  resetAnimation: () => void,
  handlePlayAlgorithm: (stepByStep: boolean) => void,
  handleChangeStart: (value: string) => void
}

const GraphToolbar = ({
  cyInstance,
  startNodeRef,
  isDirectedGraph,
  animateIsPause,
  onToggleDirected,
  nextStep,
  prevStep,
  resetAnimation,
  handlePlayAlgorithm,
  handleChangeStart,
}: GraphToolbarProps) => {

  const { runMode, selectedElements, handleResetSelectedElement, updateRunMode, updateLayoutGraph } = useGraphStore();
  const { isStepByStepStart, isEndAlgorithm, displayStepbyStep, result, updateResult, updateNodeDegree, handleResetStatus, handleLoadStatusFormFile, nodeDegrees } = useGraphStatusStore();
  const [currentLayout, setCurrentLayout] = useState("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  // ===== ZOOM AND PAN CONTROLS =====
  const zoomIn = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 1.2)
  const zoomOut = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 0.8)
  const fitToScreen = () => cyInstance.current?.fit()
  const center = () => cyInstance.current?.center()

  const handleChangeLayout = useCallback((layout: string) => {
    const cy = cyInstance.current

    if (!cy) return;
    updateLayoutGraph(layout)

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
      updateNodeDegree(sourceNode.data("label"), targetNode.data("label"), isDirectedGraph);
      cy.nodes().removeClass("hasSelected");
      handleResetSelectedElement();
    } else {
      toast.warning("Vui lòng chỉ chọn 2 nút để tạo liên kết");
    }
  }, [selectedElements, cyInstance]);

  const handleDeleteElement = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    const elementIds = new Set(selectedElements);
    const selectedNodes = cy.nodes().filter(node => elementIds.has(node.id()));
    const selectedEdges = cy.edges().filter(edge => elementIds.has(edge.id()));

    if (selectedNodes && selectedNodes.length > 0) {
      // Start - Update List Degrees
      let cloneNodeDegree = Object.fromEntries(
        Object.entries(nodeDegrees).map(([k, v]) => [k, { ...v }])
      );

      const selectedNodeLabel = new Set(selectedNodes.map(item => item.data("label")));

      cloneNodeDegree = Object.fromEntries(
        Object.entries(cloneNodeDegree).filter(([key]) => !selectedNodeLabel.has(key))
      )
      useGraphStatusStore.setState({ nodeDegrees: cloneNodeDegree });
      // End - Update List Degrees

      selectedNodes.forEach(node => {
        const connectedEdges = node.connectedEdges();

        if (connectedEdges.length > 0) {
          connectedEdges.forEach(edge => {
            const source = edge.source();
            const target = edge.target();

            if (!(elementIds.has(source.id()) && elementIds.has(target.id()))) {
              edge.remove();
              updateNodeDegree(source.data("label"), target.data("label"), isDirectedGraph, false);
            }
          });
        }
      });

      selectedNodes.remove();
    }
    if (selectedEdges && selectedEdges.length > 0) {
      selectedEdges.forEach((edge: EdgeSingular) => {
        const source = edge.source().data("label");
        const target = edge.target().data("label");
        updateNodeDegree(source, target, isDirectedGraph, false);

      });
      selectedEdges.remove();
    }
    handleResetSelectedElement();
  }, [isDirectedGraph, selectedElements, nodeDegrees, updateNodeDegree, handleResetSelectedElement]);


  const clearGraph = useCallback(() => {
    const cy = cyInstance.current;
    if (!cy) return;

    cy.elements().remove();
    handleResetSelectedElement();
    handleResetStatus();
    updateResult({ stepInfo: [], eulerCycle: [] });
    startNodeRef.current = null;
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
          cy.elements().remove();

          const graphData = JSON.parse(e.target?.result as string);
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

  const handleChangeRunMode = (value: CheckedState) => {
    if (value === true) {
      updateRunMode(RUN_MODE.STEP);
    } else updateRunMode(RUN_MODE.AUTO);
  }

  const inputDataGraphRef = useRef<HTMLTextAreaElement | null>(null);

  const handleGenerateGraph = () => {
    const cy = cyInstance.current;

    if (!cy || !inputDataGraphRef.current) {
      console.error("Cytoscape instance hoặc textarea ref chưa sẵn sàng.");
      return;
    }

    clearGraph();
    cy.elements().remove();
    const textAreaValue = inputDataGraphRef.current.value;
    const lines = textAreaValue.trim().split("\n");
    const elementsToAdd: ElementDefinition[] = [];
    const nodeLabels = new Set();

    lines.forEach(line => {
      // Bỏ qua các dòng trống
      if (line.trim() === '') return;

      // Tách dòng thành các phần: đỉnh nguồn, đỉnh đích, (tùy chọn) trọng số
      const parts = line.trim().split(/\s+/);
      console.log("Check part: ", parts);
      if (parts.length >= 2) {
        const source = parts[0];
        const target = parts[1];

        nodeLabels.add(source);
        nodeLabels.add(target);

        elementsToAdd.push({
          group: 'edges',
          data: {
            id: `e-${source}-${target}-${Math.random()}`, // Tạo ID duy nhất cho cạnh
            source: `n-${source}`,
            target: `n-${target}`,
          }
        });
      }
    });

    nodeLabels.forEach(label => {
      elementsToAdd.push({
        group: 'nodes',
        data: {
          id: `n-${label}`,
          label: label,
        }
      });
    });

    cy.add(elementsToAdd);
    const maxNode = Math.max(0, cy.nodes().length);
    const maxEdge = Math.max(0, cy.edges().length);
    handleLoadStatusFormFile(maxNode + 1, maxEdge + 1);

    // update node degree
    cy.edges().map(edge => {
      const sourceId = edge.data('source');
      const targetId = edge.data('target');

      const source = cy.$id(sourceId).data("label");
      const target = cy.$id(targetId).data("label");

      updateNodeDegree(source, target, isDirectedGraph);
    })

    handleChangeStart("");

    cy.layout({
      name: 'cose',
      animate: true,
      idealEdgeLength: 100,
      nodeOverlap: 20,
      randomize: true
    }).run();
  }

  return (
    <div className="w-full p-4">
      <div className="">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="font-bold text-2xl border-b-2 border-red-600">
              Find Euler Cycle
            </div>
            <div className="flex items-center gap-2 pl-3">
              <span className="font-semibold">Đồ thị có hướng: </span>
              <Switch
                checked={isDirectedGraph}
                onCheckedChange={onToggleDirected}
              />
            </div>

            <div className="border-l-2 border-zinc-800/30 my-1" />

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

            <div className="border-l-2 border-zinc-800/30 my-1" />

            <div className="flex gap-2">
              <Button variant={"outline"} size={"icon"} onClick={zoomIn}><ZoomIn /></Button>
              <Button variant={"outline"} size={"icon"} onClick={zoomOut}><ZoomOut /> </Button>
              <Button variant={"outline"} size={"icon"} onClick={fitToScreen}><Fullscreen /> </Button>
              <Button variant={"outline"} size={"icon"} onClick={center}><Shrink /> </Button>
            </div>

            <div className="border-l-2 border-zinc-800/30 my-1" />

            <div className="flex gap-2">
              <Button variant={"outline"} onClick={exportGraph}><FileDown />Xuất đồ thị</Button>
              <Button variant={"outline"} onClick={handleUploadClick}><FileUp /> Tải lên đồ thị </Button>
              <Input className="hidden" type="file" accept=".json" ref={fileInputRef} onChange={importGraph} />
            </div>

          </div>
          <div className="flex gap-4">
            <div className="flex gap-2">
              <Button variant={"default"} onClick={connectSelection}>Tạo liên kết</Button>
              <Button variant={"outline"} onClick={handleDeleteElement}><Eraser /> Xóa phần tử </Button>
              <Button variant={"outline"} onClick={clearGraph}><Trash2 /> Xóa đồ thị </Button>
            </div>

            <div className="border-l-2 border-zinc-800/30 my-1" />

            <div className="flex items-center space-x-2">
              <Select>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Chọn số đỉnh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none" disabled>-- Chọn số đỉnh --</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant={"default"} disabled>Tạo đồ thị</Button>
            </div>

            <div className="border-l-2 border-zinc-800/30 my-1" />

            <div className="flex gap-2">
              <div className="flex items-center gap-2 pr-2">
                <Checkbox id="check-step-by-step" checked={runMode === RUN_MODE.STEP} onCheckedChange={handleChangeRunMode} />
                <Label htmlFor="check-step-by-step" className="text-sm">Step-by-step</Label>
              </div>

              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {!animateIsPause ?
                      <Button size={"icon"}
                        onClick={() => handlePlayAlgorithm(runMode === RUN_MODE.STEP)}
                        className="bg-sky-600 text-white hover:bg-red-500 transition-all ease-linear duration-150">
                        <Pause />
                      </Button>
                      :
                      <Button size={"icon"}
                        onClick={() => handlePlayAlgorithm(runMode === RUN_MODE.STEP)}
                        className="bg-red-600 text-white hover:bg-sky-500 transition-all ease-linear duration-150">
                        <Play />
                      </Button>
                    }
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
                    <p className="flex items-center font-semibold">Chạy thuât toán</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant={"outline"} size={"icon"} onClick={prevStep} disabled={!isStepByStepStart}><SkipBack /></Button>
              <Button variant={"outline"} size={"icon"} onClick={nextStep} disabled={!isStepByStepStart}><SkipForward /></Button>
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"outline"} size={"icon"} onClick={resetAnimation}><RotateCcw /></Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-100 text-zinc-800 shadow-sm shadow-gray-500">
                    <p className="flex items-center font-semibold">Reset trạng thái</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

          </div>
        </div>
      </div>
      <div className="mt-2 w-full">
        <div className="flex gap-4">
          <div className="w-1/2 space-y-1">
            <InputToolbar inputDataGraphRef={inputDataGraphRef} handleGenerateGraph={handleGenerateGraph} />
          </div>
          <div className="w-1/2 space-y-1">
            <Output cyInstance={cyInstance} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default GraphToolbar