import { type Core, type EdgeSingular } from "cytoscape";
import { useEffect, useRef } from "react";
import CreateNodeDialog from "./CreateNodeDialog";
import { useCytoscapeInstance } from "../../hooks/useCytoscapeInstance";
import { useGraphEvents } from "../../hooks/useGraphEvent";
import { useAnalystis } from "../../hooks/useAnalystis";
import { useNodeCreation } from "../../hooks/useNodeCreation";

interface GraphCanvasProps {
  cyInstanceRef: React.RefObject<Core | null>;
  startNodeRef: React.RefObject<EdgeSingular | null>;
  isDirectedGraph: boolean;
}

const GraphCanvas = ({
  cyInstanceRef,
  isDirectedGraph,
  startNodeRef,
}: GraphCanvasProps) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const dragSourceNodeIdRef = useRef<string | null>(null)
  const tempTargetNodeIdRef = useRef<string | null>(null)
  const tempEdgeIdRef = useRef<string | null>(null)

  // init canvas
  useCytoscapeInstance(cyRef, cyInstanceRef, isDirectedGraph);
  // analystis graph
  useAnalystis(cyInstanceRef, isDirectedGraph);
  // add new node hook
  const {
    isOpenDialog,
    labelNode,
    onLabelChange,
    toggleDialogOpen,
    openNodeCreationDialog,
    handleCreateNewNode,
  } = useNodeCreation(cyInstanceRef)
  // config handle event
  const { handleEventListener } = useGraphEvents({
    isDirectedGraph,
    startNodeRef,
    dragSourceNodeIdRef,
    tempTargetNodeIdRef,
    tempEdgeIdRef,
    openNodeCreationDialog
  });

  useEffect(() => {
    if (cyInstanceRef.current) {
      handleEventListener(cyInstanceRef.current);
    }
  }, [cyInstanceRef, handleEventListener]);

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
        toggleDialog={toggleDialogOpen}
        labelNode={labelNode}
        onLableChange={onLabelChange}
        handleCreateNewNode={handleCreateNewNode}
      />
    </>
  )
}
export default GraphCanvas