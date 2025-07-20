import { type Core, type EdgeSingular } from "cytoscape";
import { useEffect, useRef, useState } from "react";
import { GraphService } from "../../services/graphService";
import CreateNodeDialog from "./CreateNodeDialog";
import { toast } from "sonner";
import { useCytoscapeInstance } from "../../hooks/useCytoscapeInstance";
import { useGraphEvents } from "../../hooks/useGraphEvent";
import { useAnalystis } from "../../hooks/useAnalystis";

interface GraphCanvasProps {
  cyInstanceRef: React.RefObject<Core | null>;
  nodeCounterRef: React.RefObject<number>;
  edgeCounterRef: React.RefObject<number>;
  startNodeRef: React.RefObject<EdgeSingular | null>;
  isDirectedGraph: boolean;
}

const GraphCanvas = ({
  cyInstanceRef,
  isDirectedGraph,
  nodeCounterRef,
  edgeCounterRef,
  startNodeRef,
}: GraphCanvasProps) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const dragSourceNodeIdRef = useRef<string | null>(null)
  const tempTargetNodeIdRef = useRef<string | null>(null)
  const tempEdgeIdRef = useRef<string | null>(null)
  const newNodePositionRef = useRef<{ x: number; y: number } | null>(null);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [labelNode, setLabelNode] = useState("");

  const toggleDialog = (value: boolean) => { setIsOpenDialog(value); }
  const onLableChange = (label: string) => { setLabelNode(label); }

  // init canvas
  useCytoscapeInstance(cyRef, cyInstanceRef, isDirectedGraph);
  // analystis graph
  useAnalystis(cyInstanceRef);


  // config handle event
  const { handleEventListener } = useGraphEvents({
    isDirectedGraph,
    nodeCounterRef,
    edgeCounterRef,
    startNodeRef,
    dragSourceNodeIdRef,
    tempTargetNodeIdRef,
    tempEdgeIdRef,
    newNodePositionRef,
    onLableChange,
    toggleDialog
  });

  useEffect(() => {
    if (cyInstanceRef.current) {
      handleEventListener(cyInstanceRef.current);
    }
  }, [cyInstanceRef, handleEventListener]);

  const handleCreateNewNode = () => {
    if (cyInstanceRef.current && newNodePositionRef.current && labelNode.trim() !== "") {
      GraphService.addNode(cyInstanceRef.current, labelNode.trim(), newNodePositionRef.current);
      nodeCounterRef.current += 1;

      setLabelNode("");
      newNodePositionRef.current = null;
      setIsOpenDialog(false);
    } else if (labelNode.trim() === "") {
      toast.error("Tên của Node không được bỏ trống.")
    }
  }

  return (
    <>
      <div className="flex-1 relative">
        <div
          ref={cyRef}
          className="w-full h-full overflow-hidden bg-white"
        />
      </div>
      <CreateNodeDialog
        isOpen={isOpenDialog}
        toggleDialog={toggleDialog}
        labelNode={labelNode}
        onLableChange={onLableChange}
        handleCreateNewNode={handleCreateNewNode}
      />
    </>
  )
}
export default GraphCanvas