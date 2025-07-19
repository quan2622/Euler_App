import type { Core } from "cytoscape";
import { useRef, useState } from "react";
import { GraphService } from "../services/graphService";
import type { GraphRefs, NodePosition } from "../types/graph.type";
import { toast } from "sonner";

export const useNodeCreation = (cy: Core, graphRefs: GraphRefs) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [labelNode, setLabelNode] = useState("");
  const nodePositionRef = useRef<NodePosition | null>(null);

  const onLabelChange = (label: string) => {
    setLabelNode(label);
  }

  const toggleDialogOpen = () => {
    setIsOpenDialog(prev => !prev);
  }

  const openNodeCreationDialog = (position: NodePosition) => {
    nodePositionRef.current = position;
    setLabelNode(`Node ${graphRefs.nodeCounterRef.current}`);
    setIsOpenDialog(true);
  };

  const handleCreateNewNode = () => {
    if (labelNode.trim() === "") {
      toast.warning("Vui lòng điền tên cho Node!");
      return;
    }

    if (cy && nodePositionRef.current) {
      GraphService.addNode(cy, labelNode.trim(), nodePositionRef.current);
      graphRefs.nodeCounterRef.current += 1;

      setLabelNode("");
      nodePositionRef.current = null;
      setIsOpenDialog(false);
    }
  };


  return {
    isOpenDialog,
    labelNode,
    onLabelChange,
    toggleDialogOpen,
    openNodeCreationDialog,
    handleCreateNewNode,
  };
}