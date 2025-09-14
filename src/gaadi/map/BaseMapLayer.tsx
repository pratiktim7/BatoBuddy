import "leaflet/dist/leaflet.css";
import { LatLngBounds } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import React, { type ReactNode, memo } from "react";

// Map configuration constants
const DEFAULT_ZOOM = 16;
const MAX_ZOOM_OUT = 13;
const MAP_CENTER: [number, number] = [27.706432, 85.323347]; // Kathmandu
const MAP_BOUNDS_TOP_LEFT: [number, number] = [27.954216, 85.127444];
const MAP_BOUNDS_BOTTOM_RIGHT: [number, number] = [27.552274, 85.580874];

interface ZoomFunctions {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface BaseMapLayerStaticProps {
  userLocation?: [number, number] | null;
  tileMapUrl?: string;
  flyToPos?: boolean;
  onZoomFunctionsReady?: (functions: ZoomFunctions) => void;
  children?: ReactNode;
}

interface BaseMapLayerProps extends BaseMapLayerStaticProps {
  className?: string;
}

const BaseMapLayerStatic: React.FC<BaseMapLayerStaticProps> = memo(
  ({ tileMapUrl, children }) => (
    <MapContainer
      center={MAP_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MAX_ZOOM_OUT}
      zoomControl={false}
      maxBounds={new LatLngBounds(MAP_BOUNDS_TOP_LEFT, MAP_BOUNDS_BOTTOM_RIGHT)}
      maxBoundsViscosity={1.0}
      style={{ height: "100%", width: "100%", flex: "1" }}
    >
      <TileLayer
        url={tileMapUrl || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {children}
    </MapContainer>
  )
);

const BaseMapLayer: React.FC<BaseMapLayerProps> = ({ children, ...rest }) => (
  <BaseMapLayerStatic {...rest}>{children}</BaseMapLayerStatic>
);

export default BaseMapLayer;
