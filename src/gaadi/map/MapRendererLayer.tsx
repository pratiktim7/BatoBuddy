import BaseMapLayer from "./BaseMapLayer";
import React, { useCallback, type ReactNode } from "react";

interface MapRendererLayerProps {
  children: ReactNode;
  className?: string;
}

interface ZoomFunctions {
  zoomIn: () => void;
  zoomOut: () => void;
}

const MapRendererLayer: React.FC<MapRendererLayerProps> = ({ children, className }) => {
  const handleZoomFunctionsReady = useCallback((functions: ZoomFunctions) => {
    console.log("Zoom functions ready:", functions);
  }, []);

  return (
    <div className={className || "w-full h-full"}>
      <BaseMapLayer
        tileMapUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        onZoomFunctionsReady={handleZoomFunctionsReady}
      >
        {children}
      </BaseMapLayer>
    </div>
  );
};

export default MapRendererLayer;
