import React, { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import type { IStop, IRoute } from './types/stop.types';

declare module "leaflet" {
  namespace Routing {
    function control(options?: any): any;
    namespace osrmv1 {
      function osrmv1(options?: any): any;
    }
  }
}

interface TransitRouteEngineProps {
  route?: IRoute | null;
  startLocation?: { lat: number; lng: number; name?: string };
  endLocation?: { lat: number; lng: number; name?: string };
  onRouteCalculated?: (routeData: any) => void;
  fitToScreen?: boolean;
}

const TransitRouteEngine: React.FC<TransitRouteEngineProps> = ({
  route,
  startLocation,
  endLocation,
  onRouteCalculated,
  fitToScreen = true
}) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  const clearRoute = useCallback(() => {
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  }, [map]);

  // Handle predefined route rendering (from route data)
  useEffect(() => {
    if (!map || !route || !route.stops || route.stops.length < 2) {
      clearRoute();
      return;
    }

    clearRoute();

    const waypoints = route.stops.map((stop: IStop) => L.latLng(stop.lat, stop.lng));

    const routingControl = (L.Routing.control as any)({
      waypoints,
      routeWhileDragging: false,
      fitSelectedRoutes: fitToScreen,
      addWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{
          color: route.lineColor || '#3B82F6',
          weight: 6,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        }],
        extendToWaypoints: false,
        missingRouteTolerance: 1000,
      },
      router: (L.Routing as any).osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      containerClassName: "hidden",
    });

    routingControl.on('routesfound', (e: any) => {
      if (onRouteCalculated && e.routes && e.routes.length > 0) {
        onRouteCalculated({
          route: e.routes[0],
          stops: route.stops,
          routeName: route.name,
          lineColor: route.lineColor
        });
      }
    });

    routingControl.on('routingerror', (e: any) => {
      console.warn('Route calculation error:', e.error);
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    return () => {
      clearRoute();
    };
  }, [map, route, fitToScreen, onRouteCalculated, clearRoute]);

  // Handle point-to-point routing (start -> end)
  useEffect(() => {
    if (!map || !startLocation || !endLocation || route) {
      return;
    }

    clearRoute();

    const waypoints = [
      L.latLng(startLocation.lat, startLocation.lng),
      L.latLng(endLocation.lat, endLocation.lng)
    ];

    const routingControl = (L.Routing.control as any)({
      waypoints,
      routeWhileDragging: false,
      fitSelectedRoutes: fitToScreen,
      addWaypoints: false,
      show: true,
      createMarker: () => null,
      lineOptions: {
        styles: [{
          color: '#10B981',
          weight: 6,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        }],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      router: (L.Routing as any).osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
    });

    routingControl.on('routesfound', (e: any) => {
      if (onRouteCalculated && e.routes && e.routes.length > 0) {
        onRouteCalculated({
          route: e.routes[0],
          startLocation,
          endLocation,
          isPointToPoint: true
        });
      }
    });

    routingControl.on('routingerror', (e: any) => {
      console.warn('Point-to-point routing error:', e.error);
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    return () => {
      clearRoute();
    };
  }, [map, startLocation, endLocation, route, fitToScreen, onRouteCalculated, clearRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRoute();
    };
  }, [clearRoute]);

  return null;
};

export default TransitRouteEngine;
