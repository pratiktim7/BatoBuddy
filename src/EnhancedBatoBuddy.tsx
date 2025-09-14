import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import MapRendererLayer from './gaadi/map/MapRendererLayer';
import TransitRouteEngine from './gaadi/TransitRouteEngine';
import RouteRenderer from './gaadi/RouteRenderer';
import { getAllRoutes, findNearbyStops } from './gaadi/utils/dataHelpers';
import SimpleLocationAutocomplete from './SimpleLocationAutocomplete';
import type { IRoute } from './gaadi/types/stop.types';
import type { LocationData } from './types/location';

// Sample route data - updated to match real data structure with string IDs
const sampleRoutes: IRoute[] = [
  {
    id: "route-1",
    name: "Ratna Park to Thamel Express",
    lineColor: "#3B82F6",
    stops: ["stop-1", "stop-2", "stop-3", "stop-4"], // Stop IDs as strings
    operator: ["Local Bus Service"],
    isVerifiedRoute: true
  },
  {
    id: "route-2", 
    name: "Patan to Durbar Marg",
    lineColor: "#10B981",
    stops: ["stop-5", "stop-6", "stop-7", "stop-8", "stop-9"], // Stop IDs as strings
    operator: ["City Bus"],
    isVerifiedRoute: true
  }
];

const EnhancedBatoBuddy: React.FC = () => {
  const [fromLocation, setFromLocation] = useState<LocationData>({ name: '' });
  const [toLocation, setToLocation] = useState<LocationData>({ name: '' });
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [availableRoutes, setAvailableRoutes] = useState<IRoute[]>([]);
  const [routeData, setRouteData] = useState<any>(null);
  const [searchMode, setSearchMode] = useState<'transit' | 'direct'>('direct');

  // Use real routes when available, fallback to sample data
  const allRoutes = useMemo(() => {
    try {
      const realRoutes = getAllRoutes();
      return realRoutes.length > 0 ? realRoutes : sampleRoutes;
    } catch (error) {
      console.warn('Failed to load real routes, using sample data:', error);
      return sampleRoutes;
    }
  }, []);

  // Find matching routes based on proximity to start/end locations
  const findMatchingRoutes = useCallback((from: LocationData, to: LocationData) => {
    if (!from.coordinates || !to.coordinates) return [];

    const matchingRoutes = allRoutes.filter(route => {
      // For now, return all available routes as we're using sample data
      // In a real implementation, you'd use findNearbyStops and check
      // if the route connects the locations
      return route.stops && route.stops.length >= 2;
    });

    return matchingRoutes.slice(0, 10); // Limit to first 10 routes for demo
  }, [allRoutes]);

  // Handle location changes and find routes
  useEffect(() => {
    if (fromLocation.coordinates && toLocation.coordinates) {
      const routes = findMatchingRoutes(fromLocation, toLocation);
      setAvailableRoutes(routes);
      
      if (routes.length > 0) {
        setSelectedRoute(routes[0]); // Auto-select first matching route
        setSearchMode('transit');
      } else {
        setSelectedRoute(null);
        setSearchMode('direct');
      }
    } else {
      setAvailableRoutes([]);
      setSelectedRoute(null);
    }
  }, [fromLocation, toLocation, findMatchingRoutes]);

  const handleRouteCalculated = useCallback((calculatedRouteData: any) => {
    console.log('Route calculated:', calculatedRouteData);
    setRouteData(calculatedRouteData);
  }, []);

  const handleFromLocationChange = useCallback((name: string, coordinates?: { lat: number; lng: number }) => {
    setFromLocation({ name, coordinates });
  }, []);

  const handleToLocationChange = useCallback((name: string, coordinates?: { lat: number; lng: number }) => {
    setToLocation({ name, coordinates });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enhanced BatoBuddy</h1>
            <p className="text-sm text-gray-500">Smart Transit & Direct Navigation</p>
          </div>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <SimpleLocationAutocomplete
              value={fromLocation.name}
              onChange={handleFromLocationChange}
              placeholder="Enter starting location"
              icon={<MapPin className="w-4 h-4 text-green-600" />}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To</label>
            <SimpleLocationAutocomplete
              value={toLocation.name}
              onChange={handleToLocationChange}
              placeholder="Enter destination"
              icon={<MapPin className="w-4 h-4 text-red-600" />}
            />
          </div>
        </div>

        {/* Route Options */}
        {availableRoutes.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Available Transit Routes ({availableRoutes.length})
            </label>
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => {
                  setSelectedRoute(null);
                  setSearchMode('direct');
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  searchMode === 'direct' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Navigation className="w-4 h-4 inline mr-1" />
                Direct Route
              </button>
              
              {availableRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => {
                    setSelectedRoute(route);
                    setSearchMode('transit');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedRoute?.id === route.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: selectedRoute?.id === route.id ? route.lineColor : undefined
                  }}
                >
                  <Search className="w-4 h-4 inline mr-1" />
                  {route.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Route Info */}
        {routeData && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                {routeData.isPointToPoint ? (
                  <p className="text-sm font-medium text-blue-800">Direct Route Found</p>
                ) : (
                  <p className="text-sm font-medium text-blue-800">
                    Transit Route: {routeData.routeName}
                  </p>
                )}
                {routeData.route?.summary && (
                  <p className="text-xs text-blue-600">
                    Distance: {(routeData.route.summary.totalDistance / 1000).toFixed(1)}km • 
                    Time: {Math.round(routeData.route.summary.totalTime / 60)}min
                  </p>
                )}
              </div>
              {routeData.lineColor && (
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: routeData.lineColor }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapRendererLayer className="w-full h-full">
          {/* Direct routing engine */}
          {searchMode === 'direct' && fromLocation.coordinates && toLocation.coordinates && (
            <TransitRouteEngine
              startLocation={fromLocation.coordinates}
              endLocation={toLocation.coordinates}
              onRouteCalculated={handleRouteCalculated}
              fitToScreen={true}
            />
          )}

          {/* Transit route renderer */}
          {searchMode === 'transit' && selectedRoute && (
            <>
              <RouteRenderer
                stopIds={selectedRoute.stops}
                lineColor={selectedRoute.lineColor}
                fitToScreen={true}
                showDetailedPopup={true}
              />
              <TransitRouteEngine
                route={selectedRoute}
                onRouteCalculated={handleRouteCalculated}
                fitToScreen={true}
              />
            </>
          )}
        </MapRendererLayer>
      </div>
    </div>
  );
};

export default EnhancedBatoBuddy;
