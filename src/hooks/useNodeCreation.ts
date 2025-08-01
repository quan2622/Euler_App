import type { Core } from "cytoscape";
import { useCallback, useEffect, useRef, useState } from "react";
import { GraphService } from "../services/graphService";
import type { NodePosition } from "../types/graph.type";
import { toast } from "sonner";
import { useGraphStatusStore } from "../store/useGraphStatusStore";

export const useNodeCreation = (
  cyInstanceRef: React.RefObject<Core | null>,
) => {

  const { nodeCounter, initDegreeForNode } = useGraphStatusStore();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [labelNode, setLabelNode] = useState("");
  const nodePositionRef = useRef<{ x: number; y: number } | null>(null);
  const nodeCounterRef = useRef<number>(nodeCounter);
  useEffect(() => {
    nodeCounterRef.current = nodeCounter;
  }, [nodeCounter]);

  const onLabelChange = (label: string) => {
    setLabelNode(label);
  }

  const toggleDialogOpen = () => {
    setIsOpenDialog(prev => !prev);
  }
  const openNodeCreationDialog = (position: NodePosition) => {
    nodePositionRef.current = position;
    setLabelNode(`Node ${nodeCounterRef.current}`);
    setIsOpenDialog(true);
  };

  const handleCreateNewNode = useCallback(() => {
    if (labelNode.trim() === "") {
      toast.warning("Vui lòng điền tên cho Node!");
      return;
    }

    if (cyInstanceRef.current && nodePositionRef.current) {
      const id = `node-${Date.now()}`;
      GraphService.addNode(cyInstanceRef.current, labelNode.trim(), nodePositionRef.current, id);
      initDegreeForNode(id);

      setLabelNode("");
      nodePositionRef.current = null;
      setIsOpenDialog(false);
    }
  }, [labelNode, initDegreeForNode]);

  return {
    isOpenDialog,
    labelNode,
    onLabelChange,
    toggleDialogOpen,
    openNodeCreationDialog,
    handleCreateNewNode,
  };
}