/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Core, NodeSingular } from "cytoscape"
import { Button } from "../../components/ui/button"
import React, { useRef, useState } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Eraser, FileDown, FileUp, Fullscreen, Shrink, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useGraphStatusStore } from "../../store/useGraphStatusStore";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { RUN_MODE } from "../../utils/constant";
import Output from "./ToolbarContent/OutputComponent/Output";
import InputToolbar from "./ToolbarContent/InputComponent/InputToolbar";
import RunTool from "./ToolbarContent/RunToolComponent/RunTool";
import useGraphZoomControls from "../../hooks/useGraphZoomControls";
import useGraphLayout from "../../hooks/useGraphLayout";
import useGraphImportExport from "../../hooks/useGraphImportExport";
import useGraphElementManagement from "../../hooks/useGraphElementManagement";
import useGraphGeneration from "../../hooks/useGraphGeneration";

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

  const { runMode, updateRunMode } = useGraphStore();
  const { handleLoadStatusFormFile } = useGraphStatusStore();
  const [currentLayout, setCurrentLayout] = useState("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputDataGraphRef = useRef<HTMLTextAreaElement | null>(null);

  // ------------------------ CUSTOM HOOK ------------------------
  const { zoomIn, zoomOut, fitToScreen, center } = useGraphZoomControls({ cyInstance });

  const { handleChangeLayout } = useGraphLayout({ cyInstance });

  const { exportGraph, importGraph } = useGraphImportExport({
    cyInstance,
    isDirectedGraph,
    currentLayout,
    setCurrentLayout,
    onToggleDirected,
    handleLoadStatusFormFile,
  });

  const { connectSelection, handleDeleteElement, clearGraph } = useGraphElementManagement({
    cyInstance,
    isDirectedGraph,
    startNodeRef,
    inputDataGraphRef,
  });

  const { handleGenerateGraph } = useGraphGeneration({
    cyInstance,
    inputDataGraphRef,
    isDirectedGraph,
    handleChangeStart,
  });
  // ------------------------ CUSTOM HOOK ------------------------


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleChangeRunMode = (value: CheckedState) => {
    if (value === true) {
      updateRunMode(RUN_MODE.STEP);
    } else updateRunMode(RUN_MODE.AUTO);
  }

  const handleSelectNumber = (value: string) => {
    if (!inputDataGraphRef.current) return;
    const vertexCount = +value;

    const vertices = Array.from({ length: vertexCount }, (_, i) => String.fromCharCode(65 + i));

    const edges = [];
    for (let i = 1; i < vertexCount; i++) {
      const randomParent = Math.floor(Math.random() * (vertexCount - 1));
      edges.push(`${vertices[randomParent]} ${vertices[i]}`);
    }

    for (let i = 0; i < vertexCount; i++) {
      for (let j = i + 1; j < vertexCount; j++) {
        if (Math.random() > 0.5) {
          edges.push(`${vertices[i]} ${vertices[j]}`);
        }
      }
    }

    inputDataGraphRef.current.value = edges.join("\n");
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
              <Select
                onValueChange={(value) => handleSelectNumber(value)}>
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
              <Button variant={"default"} onClick={handleGenerateGraph}>Tạo đồ thị</Button>
            </div>

            <div className="border-l-2 border-zinc-800/30 my-1" />

            <RunTool
              runMode={runMode}
              animateIsPause={animateIsPause}
              handleChangeRunMode={handleChangeRunMode}
              handlePlayAlgorithm={handlePlayAlgorithm}
              nextStep={nextStep}
              prevStep={prevStep}
              resetAnimation={resetAnimation}
            />

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