import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced location interface
interface LocationData {
  // support both shapes used in the app: either { lat, lng } or { coordinates: { lat, lng } }
  lat?: number;
  lng?: number;
  name?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

interface OpenStreetMapComponentProps {
  // Props used by BatoBuddyClean
  fromLocation?: LocationData;
  toLocation?: LocationData;
  onLocationSelect?: (coord: { lat: number; lng: number }, type: 'from' | 'to') => void;
  isSelectionMode?: boolean;
  selectionType?: 'from' | 'to';
}

// Component to handle map click events
const MapClickHandler: React.FC<{
  isSelectionMode: boolean;
  selectionType: 'from' | 'to' | undefined;
  onLocationSelect?: (coord: { lat: number; lng: number }, type: 'from' | 'to') => void;
}> = ({ isSelectionMode, selectionType, onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked at:', e.latlng);
      if (!isSelectionMode || !selectionType) return;
      const coord = { lat: e.latlng.lat, lng: e.latlng.lng };
      console.log('Calling onLocationSelect with:', coord, selectionType);
      onLocationSelect && onLocationSelect(coord, selectionType);
    },
  });
  return null;
};

// Routing Machine Component
const RoutingMachine: React.FC<{
  start?: { lat: number; lng: number } | undefined;
  destination?: { lat: number; lng: number } | undefined;
  onRouteFound?: (route: any) => void;
}> = ({ start, destination, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    console.log('RoutingMachine effect triggered', { start, destination });
    
  if (!start || !destination) {
      console.log('Missing start or destination, clearing route');
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    console.log('Creating route from', start, 'to', destination);

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create new routing control
    const routingControl = (L.Routing.control as any)({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(destination.lat, destination.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: function() { return null; }, // We'll use our own markers
      lineOptions: {
        styles: [
          { color: '#6366f1', weight: 6, opacity: 0.8 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      show: true,
      collapsible: true,
      router: (L.Routing as any).osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      })
    }).on('routesfound', function(e: any) {
      console.log('Route found:', e);
      const routes = e.routes;
      if (routes.length > 0 && onRouteFound) {
        onRouteFound(routes[0]);
      }
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map, start, destination, onRouteFound]);

  return null;
};

// Route Info Display Component
const RouteInfoOverlay: React.FC<{
  route: any;
  isVisible: boolean;
  onClose: () => void;
}> = ({ route, isVisible, onClose }) => {
  if (!isVisible || !route) return null;

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm z-[1000] max-h-96 overflow-y-auto">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg dark:text-white">Route Information</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Distance:</span>
          <span className="font-medium dark:text-white">{formatDistance(route.summary.totalDistance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Time:</span>
          <span className="font-medium dark:text-white">{formatTime(route.summary.totalTime)}</span>
        </div>
      </div>

      {route.instructions && route.instructions.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 dark:text-white">Turn-by-turn Directions:</h4>
          <div className="space-y-1 text-sm">
            {route.instructions.slice(0, 10).map((instruction: any, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 dark:text-blue-400 font-medium min-w-[20px]">
                  {index + 1}.
                </span>
                <div>
                  <div className="dark:text-gray-200">{instruction.text}</div>
                  {instruction.distance > 0 && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDistance(instruction.distance)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {route.instructions.length > 10 && (
              <div className="text-gray-500 dark:text-gray-400 text-xs italic">
                ... and {route.instructions.length - 10} more steps
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OpenStreetMapComponent: React.FC<OpenStreetMapComponentProps> = ({
  fromLocation,
  toLocation,
  onLocationSelect,
  isSelectionMode = false,
  selectionType
}) => {
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [showRouteInfo, setShowRouteInfo] = useState(false);

  console.log('OpenStreetMapComponent render:', {
    fromLocation,
    toLocation,
    isSelectionMode,
    selectionType
  });

  // Default center (Kathmandu, Nepal)
  const defaultCenter: [number, number] = [27.7172, 85.3240];
  
  // Determine map center based on available locations
  const extractCoord = (loc?: LocationData) => {
    if (!loc) return undefined;
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') return { lat: loc.lat, lng: loc.lng };
    if (loc.coordinates && typeof loc.coordinates.lat === 'number' && typeof loc.coordinates.lng === 'number') return { lat: loc.coordinates.lat, lng: loc.coordinates.lng };
    return undefined;
  };

  const startCoord = extractCoord(fromLocation);
  const destCoord = extractCoord(toLocation);

  const getMapCenter = (): [number, number] => {
    if (startCoord) return [startCoord.lat, startCoord.lng];
    if (destCoord) return [destCoord.lat, destCoord.lng];
    return defaultCenter;
  };

  const handleMapClick = useCallback((coord: { lat: number; lng: number }, type: 'from' | 'to') => {
    console.log('handleMapClick called with:', coord, type);
    onLocationSelect && onLocationSelect(coord, type);
  }, [onLocationSelect]);

  const handleRouteFound = useCallback((route: any) => {
    console.log('Route found in component:', route);
    setRouteInfo(route);
    setShowRouteInfo(true);
  }, []);

  // Create custom markers
  const createCustomMarker = (color: string, label: string) => {
    return new L.DivIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 25px;
          height: 25px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">${label}</span>
        </div>
      `,
      iconSize: [25, 35],
      iconAnchor: [12, 35],
      popupAnchor: [1, -34],
    });
  };

  const startMarkerIcon = createCustomMarker('#10b981', 'S');
  const destinationMarkerIcon = createCustomMarker('#f59e0b', 'D');

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="map-tiles"
        />
        
        <MapClickHandler
          isSelectionMode={isSelectionMode}
          selectionType={selectionType}
          onLocationSelect={handleMapClick}
        />

        {startCoord && (
          <Marker
            position={[startCoord.lat, startCoord.lng]}
            icon={startMarkerIcon}
          >
            <Popup>
              <div>
                <strong>Start Location</strong><br />
                {fromLocation?.name && <div>{fromLocation.name}</div>}
                {fromLocation?.address && <div className="text-sm text-gray-600">{fromLocation.address}</div>}
                <div className="text-xs text-gray-500">
                  {startCoord.lat.toFixed(6)}, {startCoord.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {destCoord && (
          <Marker
            position={[destCoord.lat, destCoord.lng]}
            icon={destinationMarkerIcon}
          >
            <Popup>
              <div>
                <strong>Destination</strong><br />
                {toLocation?.name && <div>{toLocation.name}</div>}
                {toLocation?.address && <div className="text-sm text-gray-600">{toLocation.address}</div>}
                <div className="text-xs text-gray-500">
                  {destCoord.lat.toFixed(6)}, {destCoord.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <RoutingMachine 
          start={startCoord}
          destination={destCoord}
          onRouteFound={handleRouteFound}
        />
      </MapContainer>

      <RouteInfoOverlay
        route={routeInfo}
        isVisible={showRouteInfo}
        onClose={() => setShowRouteInfo(false)}
      />

      {isSelectionMode && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>
              {selectionType === 'from' ? 'Click on map to select start location' : 'Click on map to select destination'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenStreetMapComponent;
