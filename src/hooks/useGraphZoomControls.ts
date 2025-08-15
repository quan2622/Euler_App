import { useCallback } from "react";
import type { Core } from "cytoscape";

interface UseGraphZoomControlsProps {
  cyInstance: React.RefObject<Core | null>;
}

const useGraphZoomControls = ({ cyInstance }: UseGraphZoomControlsProps) => {
  const zoomIn = useCallback(() => {
    cyInstance.current?.zoom(cyInstance.current.zoom() * 1.2);
  }, [cyInstance]);

  const zoomOut = useCallback(() => {
    cyInstance.current?.zoom(cyInstance.current.zoom() * 0.8);
  }, [cyInstance]);

  const fitToScreen = useCallback(() => {
    cyInstance.current?.fit();
  }, [cyInstance]);

  const center = useCallback(() => {
    cyInstance.current?.center();
  }, [cyInstance]);

  return {
    zoomIn,
    zoomOut,
    fitToScreen,
    center
  };
};

export default useGraphZoomControls;
