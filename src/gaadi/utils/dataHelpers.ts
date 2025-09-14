import stopsData from "../data/stops_data.json";
import routesData from "../data/route_data.json";
import type { IStop, IRoute } from "../types/stop.types";

// Utility functions for working with the real data
export function getStopById(stopId: string): IStop | undefined {
  return (stopsData as IStop[]).find(stop => stop.id === stopId);
}

export function getRouteById(routeId: string): IRoute | undefined {
  return (routesData as any[]).find(route => route.id === routeId);
}

export function getStopsForRoute(routeId: string): IStop[] {
  const route = getRouteById(routeId);
  if (!route || !route.stops) return [];
  
  return route.stops
    .map(stopId => getStopById(stopId))
    .filter(Boolean) as IStop[];
}

export function getAllRoutes(): IRoute[] {
  return routesData as any[];
}

export function getAllStops(): IStop[] {
  return stopsData as IStop[];
}

export function findNearbyStops(lat: number, lng: number, radiusKm: number = 1): IStop[] {
  const stops = getAllStops();
  return stops.filter(stop => {
    const distance = calculateDistance(lat, lng, stop.lat, stop.lng);
    return distance <= radiusKm;
  });
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
