import type { Core, NodeSingular } from "cytoscape"
import { Button } from "../../components/ui/button"
import { useCallback, useState } from "react";
import { useGraphStore } from "../../store/useGraphStore";
import { GraphService } from "../../services/graphService";
import { toast } from "sonner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Fullscreen, Shrink, ZoomIn, ZoomOut } from "lucide-react";

interface GraphToolbarProps {
  cyInstance: React.RefObject<Core | null>,
  isDirectedGraph: boolean,
  edgeCounterRef: React.RefObject<number>
  onToggleDirected: () => void,
}

const GraphToolbar = ({
  cyInstance,
  isDirectedGraph,
  edgeCounterRef,
  onToggleDirected
}: GraphToolbarProps) => {

  const { selectedElements } = useGraphStore();
  const [currentLayout, setCurrentLayout] = useState("grid");


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
    const selectedNode = cy.elements(selectors).nodes();

    if (selectedNode.length === 2) {
      const sourceNode = selectedNode[0];
      const targetNode = selectedNode[1];


      GraphService.addEdge(cy, sourceNode.id(), targetNode.id());
      edgeCounterRef.current += 1;
      cy.nodes().removeClass("hasSelected");
    } else {
      toast.warning("Vui lòng chỉ chọn 2 nút để tạo liên kết");
    }
  }, []);



  return (
    <div className="h-60 w-full border-red-600 border-2">
      toolbars
      <Button variant={'outline'} onClick={onToggleDirected}>{isDirectedGraph ? "Có hướng" : "Vô hướng"}</Button>
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
      <div className="flex gap-2 mt-2">
        <Button variant={"outline"} size={"icon"} onClick={zoomIn}><ZoomIn /></Button>
        <Button variant={"outline"} size={"icon"} onClick={zoomOut}><ZoomOut /> </Button>
        <Button variant={"outline"} size={"icon"} onClick={fitToScreen}><Fullscreen /> </Button>
        <Button variant={"outline"} size={"icon"} onClick={center}><Shrink /> </Button>
      </div>
    </div>
  )
}
export default GraphToolbar