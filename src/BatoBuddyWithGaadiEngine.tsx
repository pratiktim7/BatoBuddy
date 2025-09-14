import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Bus, 
  Search,
  Settings,
  Star,
  Plus,
  ChevronRight,
  Zap,
  RotateCw,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RouteRenderer from './gaadi/RouteRenderer';
import TransitRouteEngine from './gaadi/TransitRouteEngine';
import { getAllRoutes, findNearbyStops, getAllStops } from './gaadi/utils/dataHelpers';
import type { IRoute, IStop } from './gaadi/types/stop.types';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different marker types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${icon}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Landmark data for Kathmandu Valley
const landmarks = {
  restaurants: [
    { id: 'r1', name: 'Fire and Ice Pizzeria', lat: 27.7115, lng: 85.3131, category: 'restaurant' },
    { id: 'r2', name: 'Dhokaima Cafe', lat: 27.7172, lng: 85.3240, category: 'restaurant' },
    { id: 'r3', name: 'Bhojan Griha', lat: 27.7089, lng: 85.3089, category: 'restaurant' },
    { id: 'r4', name: 'Kaiser Cafe', lat: 27.7144, lng: 85.3206, category: 'restaurant' },
    { id: 'r5', name: 'Roadhouse Cafe', lat: 27.7095, lng: 85.3167, category: 'restaurant' },
  ],
  landmarks: [
    { id: 'l1', name: 'Kathmandu Durbar Square', lat: 27.7045, lng: 85.3079, category: 'landmark' },
    { id: 'l2', name: 'Swayambhunath Temple', lat: 27.7149, lng: 85.2903, category: 'landmark' },
    { id: 'l3', name: 'Boudhanath Stupa', lat: 27.7213, lng: 85.3616, category: 'landmark' },
    { id: 'l4', name: 'Pashupatinath Temple', lat: 27.7106, lng: 85.3487, category: 'landmark' },
    { id: 'l5', name: 'Thamel', lat: 27.7144, lng: 85.3097, category: 'landmark' },
    { id: 'l6', name: 'New Road', lat: 27.7017, lng: 85.3142, category: 'landmark' },
  ],
  parks: [
    { id: 'p1', name: 'Ratna Park', lat: 27.7052, lng: 85.3156, category: 'park' },
    { id: 'p2', name: 'Garden of Dreams', lat: 27.7130, lng: 85.3151, category: 'park' },
    { id: 'p3', name: 'Shivapuri National Park', lat: 27.8000, lng: 85.3833, category: 'park' },
    { id: 'p4', name: 'Tribhuvan Park', lat: 27.6939, lng: 85.3378, category: 'park' },
  ],
  hospitals: [
    { id: 'h1', name: 'Tribhuvan University Teaching Hospital', lat: 27.6795, lng: 85.3378, category: 'hospital' },
    { id: 'h2', name: 'Bir Hospital', lat: 27.7048, lng: 85.3142, category: 'hospital' },
    { id: 'h3', name: 'Civil Hospital', lat: 27.6939, lng: 85.3378, category: 'hospital' },
    { id: 'h4', name: 'Norvic International Hospital', lat: 27.7144, lng: 85.3206, category: 'hospital' },
  ],
  schools: [
    { id: 's1', name: 'Tribhuvan University', lat: 27.6795, lng: 85.3378, category: 'school' },
    { id: 's2', name: 'Kathmandu University', lat: 27.6167, lng: 85.5389, category: 'school' },
    { id: 's3', name: 'St. Xavier\'s College', lat: 27.7089, lng: 85.3167, category: 'school' },
    { id: 's4', name: 'Tri-Chandra College', lat: 27.7095, lng: 85.3167, category: 'school' },
  ],
  shopping: [
    { id: 'sh1', name: 'City Centre Mall', lat: 27.7017, lng: 85.3142, category: 'shopping' },
    { id: 'sh2', name: 'Labim Mall', lat: 27.6939, lng: 85.3378, category: 'shopping' },
    { id: 'sh3', name: 'Asan Bazaar', lat: 27.7061, lng: 85.3094, category: 'shopping' },
    { id: 'sh4', name: 'Indra Chowk', lat: 27.7052, lng: 85.3089, category: 'shopping' },
  ]
};

const landmarkIcons = {
  restaurant: { color: '#F59E0B', icon: '🍽️' },
  landmark: { color: '#8B5CF6', icon: '🏛️' },
  park: { color: '#10B981', icon: '🌳' },
  hospital: { color: '#EF4444', icon: '🏥' },
  school: { color: '#3B82F6', icon: '🎓' },
  shopping: { color: '#F97316', icon: '🛍️' }
};

// Landmark Markers Component
const LandmarkMarkers: React.FC<{
  visibleCategories: string[];
}> = ({ visibleCategories }) => {
  const map = useMap();

  useEffect(() => {
    // Clear existing landmark markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as any)._isLandmark) {
        map.removeLayer(layer);
      }
    });

    // Add markers for visible categories
    visibleCategories.forEach(category => {
      if (landmarks[category as keyof typeof landmarks]) {
        landmarks[category as keyof typeof landmarks].forEach(landmark => {
          const iconConfig = landmarkIcons[landmark.category as keyof typeof landmarkIcons];
          const marker = L.marker(
            [landmark.lat, landmark.lng],
            { 
              icon: createCustomIcon(iconConfig.color, iconConfig.icon),
            }
          ).addTo(map);
          
          // Mark as landmark marker for cleanup
          (marker as any)._isLandmark = true;
          
          marker.bindPopup(`
            <div style="text-align: center; padding: 4px;">
              <strong style="color: ${iconConfig.color};">${landmark.name}</strong><br>
              <small style="color: #666;">${landmark.category.charAt(0).toUpperCase() + landmark.category.slice(1)}</small>
            </div>
          `);
        });
      }
    });
  }, [map, visibleCategories]);

  return null;
};

// Dynamic Map Update Component
const DynamicMapUpdater: React.FC<{
  fromLocation: { name: string; coordinates?: { lat: number; lng: number } };
  toLocation: { name: string; coordinates?: { lat: number; lng: number } };
}> = ({ fromLocation, toLocation }) => {
  const map = useMap();

  useEffect(() => {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add from marker
    if (fromLocation.coordinates) {
      const fromMarker = L.marker(
        [fromLocation.coordinates.lat, fromLocation.coordinates.lng],
        { icon: createCustomIcon('#10B981', 'F') }
      ).addTo(map);
      fromMarker.bindPopup(`<b>From:</b> ${fromLocation.name}`);
    }

    // Add to marker
    if (toLocation.coordinates) {
      const toMarker = L.marker(
        [toLocation.coordinates.lat, toLocation.coordinates.lng],
        { icon: createCustomIcon('#EF4444', 'T') }
      ).addTo(map);
      toMarker.bindPopup(`<b>To:</b> ${toLocation.name}`);
    }

    // Fit map to show both markers
    if (fromLocation.coordinates && toLocation.coordinates) {
      const group = L.featureGroup([
        L.marker([fromLocation.coordinates.lat, fromLocation.coordinates.lng]),
        L.marker([toLocation.coordinates.lat, toLocation.coordinates.lng])
      ]);
      map.fitBounds(group.getBounds().pad(0.1));
    } else if (fromLocation.coordinates) {
      map.setView([fromLocation.coordinates.lat, fromLocation.coordinates.lng], 14);
    } else if (toLocation.coordinates) {
      map.setView([toLocation.coordinates.lat, toLocation.coordinates.lng], 14);
    }
  }, [map, fromLocation, toLocation]);

  return null;
};

interface IntermediateStop {
  id: string;
  value: string;
}

interface LocationData {
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface RouteResult {
  id: string;
  duration: string;
  cost: string;
  transfers: number;
  route: IRoute;
  nearbyStops: {
    start: IStop;
    end: IStop;
  };
  steps: Array<{
    type: 'walk' | 'bus' | 'transfer';
    duration: string;
    description: string;
    vehicle?: string;
  }>;
}

const BatoBuddyWithGaadiEngine: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [fromLocation, setFromLocation] = useState<LocationData>({ name: '' });
  const [toLocation, setToLocation] = useState<LocationData>({ name: '' });
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [allRoutes, setAllRoutes] = useState<IRoute[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasStudentId, setHasStudentId] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  const [isStudentDiscountActive, setIsStudentDiscountActive] = useState(false);
  
  // Landmark category visibility state
  const [visibleLandmarkCategories, setVisibleLandmarkCategories] = useState<string[]>([]);
  const [showLandmarkCategories, setShowLandmarkCategories] = useState(false);

  // Load real routes data on component mount
  useEffect(() => {
    try {
      const routes = getAllRoutes();
      setAllRoutes(routes);
      console.log(`Loaded ${routes.length} real bus routes from gaadi-guide`);
    } catch (error) {
      console.warn('Failed to load real routes:', error);
      setAllRoutes([]);
    }
  }, []);

  // Recent searches with actual bus stop area names
  const recentSearches = useMemo(() => [
    { from: 'Kalanki', to: 'Koteshwor stop', time: '25 min' },
    { from: 'Baneshwor', to: 'Thamel', time: '15 min' },
    { from: 'Airport', to: 'New Road', time: '25 min' },
    { from: 'Bus Route Thankot', to: 'Dhulikhel', time: '55 min' }
  ], []);

  // STABLE EVENT HANDLERS - These prevent input from losing focus
  const handleFromLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFromLocation(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleToLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setToLocation(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleIntermediateStopChange = useCallback((id: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setIntermediateStops(prev => prev.map(stop => 
        stop.id === id ? { ...stop, value } : stop
      ));
    };
  }, []);

  const addIntermediateStop = useCallback(() => {
    setIntermediateStops(prev => [...prev, { id: `stop-${Date.now()}`, value: '' }]);
  }, []);

  const removeIntermediateStop = useCallback((id: string) => {
    setIntermediateStops(prev => prev.filter(stop => stop.id !== id));
  }, []);

  const handleRecentSearchClick = useCallback((from: string, to: string) => {
    setFromLocation({ name: from });
    setToLocation({ name: to });
  }, []);

  // Real location search using actual bus stop data
  const findLocationByName = useCallback((locationName: string): { stops: IStop[], coords: { lat: number; lng: number } } => {
    const allStops = getAllStops();
    const searchTerm = locationName.toLowerCase().trim();
    
    // Find stops that match the location name
    const matchingStops = allStops.filter(stop => {
      const stopName = stop.name.toLowerCase();
      return stopName.includes(searchTerm) || 
             searchTerm.includes(stopName.split(' ')[0]) ||
             stopName.includes(searchTerm.split(' ')[0]);
    });

    console.log(`Found ${matchingStops.length} stops matching "${locationName}":`, 
                matchingStops.slice(0, 5).map(s => s.name));

    if (matchingStops.length > 0) {
      // Use the center of matching stops as coordinates
      const avgLat = matchingStops.reduce((sum, stop) => sum + stop.lat, 0) / matchingStops.length;
      const avgLng = matchingStops.reduce((sum, stop) => sum + stop.lng, 0) / matchingStops.length;
      
      return {
        stops: matchingStops.slice(0, 10), // Limit to 10 best matches
        coords: { lat: avgLat, lng: avgLng }
      };
    }

    // Fallback: try area-based search with expanded matching
    const areaMatches = allStops.filter(stop => {
      const stopName = stop.name.toLowerCase();
      const words = searchTerm.split(' ');
      return words.some(word => word.length > 2 && stopName.includes(word));
    });

    console.log(`Area-based search found ${areaMatches.length} stops for "${locationName}"`);

    if (areaMatches.length > 0) {
      const avgLat = areaMatches.reduce((sum, stop) => sum + stop.lat, 0) / areaMatches.length;
      const avgLng = areaMatches.reduce((sum, stop) => sum + stop.lng, 0) / areaMatches.length;
      
      return {
        stops: areaMatches.slice(0, 10),
        coords: { lat: avgLat, lng: avgLng }
      };
    }

    // Final fallback to hardcoded locations for very common places
    const fallbackMap: { [key: string]: { lat: number; lng: number } } = {
      'kathmandu': { lat: 27.7172, lng: 85.3240 },
      'thamel': { lat: 27.7152, lng: 85.3080 },
      'ratna park': { lat: 27.7017, lng: 85.3142 },
      'new bus park': { lat: 27.6958, lng: 85.3144 },
      'patan': { lat: 27.6766, lng: 85.3261 },
    };

    const fallbackCoords = fallbackMap[searchTerm] || { lat: 27.7172, lng: 85.3240 };
    const nearbyStops = findNearbyStops(fallbackCoords.lat, fallbackCoords.lng, 2);
    
    console.log(`Using fallback location for "${locationName}", found ${nearbyStops.length} nearby stops`);
    
    return {
      stops: nearbyStops,
      coords: fallbackCoords
    };
  }, []);

  // Improved route finding with better logic and debugging
  const findConnectingRoutes = useCallback((fromStops: IStop[], toStops: IStop[]): IRoute[] => {
    console.log(`Finding routes between ${fromStops.length} from-stops and ${toStops.length} to-stops`);
    
    if (fromStops.length === 0 || toStops.length === 0) {
      console.log('No nearby stops found');
      return [];
    }

    const directRoutes: IRoute[] = [];
    const connectingRoutes: IRoute[] = [];
    const fromStopIds = new Set(fromStops.map(stop => stop.id));
    const toStopIds = new Set(toStops.map(stop => stop.id));

    console.log('From stop IDs:', Array.from(fromStopIds).slice(0, 5));
    console.log('To stop IDs:', Array.from(toStopIds).slice(0, 5));

    for (const route of allRoutes) {
      if (!route.stops || route.stops.length === 0) continue;
      
      const routeStopIds = new Set(route.stops);
      const hasFromStop = Array.from(fromStopIds).some(stopId => routeStopIds.has(stopId));
      const hasToStop = Array.from(toStopIds).some(stopId => routeStopIds.has(stopId));
      
      // Direct route - passes through both locations
      if (hasFromStop && hasToStop) {
        console.log(`Direct route found: ${route.name} (${route.id})`);
        directRoutes.push(route);
      }
      // Connecting route - passes through one of the locations
      else if (hasFromStop || hasToStop) {
        connectingRoutes.push(route);
      }
    }

    // Prioritize direct routes, then add connecting routes if needed
    let result = [...directRoutes];
    if (result.length < 3) {
      result = [...result, ...connectingRoutes.slice(0, 5 - result.length)];
    }

    console.log(`Found ${directRoutes.length} direct routes and ${connectingRoutes.length} connecting routes`);
    console.log('Selected routes:', result.map(r => r.name).slice(0, 3));

    return result.slice(0, 5);
  }, [allRoutes]);

  const generateRouteSteps = useCallback((route: IRoute, startStop: IStop, endStop: IStop) => {
    return [
      {
        type: 'walk' as const,
        duration: '3 min',
        description: `Walk to ${startStop.name} Bus Stop`
      },
      {
        type: 'bus' as const,
        duration: '12 min',
        description: `${route.name} → ${endStop.name}`,
        vehicle: route.name
      },
      {
        type: 'walk' as const,
        duration: '2 min',
        description: `Walk to destination from ${endStop.name}`
      }
    ];
  }, []);

  const handleSearch = useCallback(async () => {
    if (!fromLocation.name || !toLocation.name) return;

    setIsSearching(true);
    
    try {
      console.log(`Searching routes from "${fromLocation.name}" to "${toLocation.name}"`);
      
      // Use real location search instead of simulated geocoding
      const fromLocationData = findLocationByName(fromLocation.name);
      const toLocationData = findLocationByName(toLocation.name);
      
      setFromLocation(prev => ({ ...prev, coordinates: fromLocationData.coords }));
      setToLocation(prev => ({ ...prev, coordinates: toLocationData.coords }));

      console.log('From location data:', fromLocationData);
      console.log('To location data:', toLocationData);

      // Use the stops found directly from location search
      const nearbyFromStops = fromLocationData.stops;
      const nearbyToStops = toLocationData.stops;

      console.log(`Found ${nearbyFromStops.length} stops for from-location`);
      console.log(`Found ${nearbyToStops.length} stops for to-location`);

      if (nearbyFromStops.length === 0 || nearbyToStops.length === 0) {
        console.log('No stops found for the specified locations');
        setRouteResults([]);
        setIsSearching(false);
        setCurrentScreen('results');
        return;
      }

      const connectingRoutes = findConnectingRoutes(nearbyFromStops, nearbyToStops);
      
      if (connectingRoutes.length === 0) {
        console.log('No connecting routes found');
        setRouteResults([]);
        setIsSearching(false);
        setCurrentScreen('results');
        return;
      }

      const results: RouteResult[] = connectingRoutes.slice(0, 3).map((route, index) => {
        // Find the best stop pairs for this route
        const routeStops = new Set(route.stops);
        const validFromStops = nearbyFromStops.filter(stop => routeStops.has(stop.id));
        const validToStops = nearbyToStops.filter(stop => routeStops.has(stop.id));
        
        const startStop = validFromStops.length > 0 ? validFromStops[0] : nearbyFromStops[0];
        const endStop = validToStops.length > 0 ? validToStops[0] : nearbyToStops[0];
        
        console.log(`Route ${route.name}: ${startStop.name} → ${endStop.name}`);
        
        // Calculate fare with student discount if applicable
        const baseFare = 20 + index * 10;
        const finalFare = calculateDiscountedFare(baseFare);
        
        return {
          id: route.id,
          duration: `${15 + index * 5} mins`,
          cost: `Rs. ${finalFare}${isStudentDiscountActive ? ' (Student)' : ''}`,
          transfers: validFromStops.length > 0 && validToStops.length > 0 ? 0 : Math.floor(Math.random() * 2) + 1,
          route: route,
          nearbyStops: { start: startStop, end: endStop },
          steps: generateRouteSteps(route, startStop, endStop)
        };
      });

      console.log(`Generated ${results.length} route results`);
      setRouteResults(results);
      
      setTimeout(() => {
        setIsSearching(false);
        setCurrentScreen('results');
      }, 2000);
    } catch (error) {
      console.error('Search failed:', error);
      setIsSearching(false);
      setRouteResults([]);
      setCurrentScreen('results');
    }
  }, [fromLocation.name, toLocation.name, findLocationByName, findConnectingRoutes, generateRouteSteps]);

  const handleRouteSelect = useCallback((routeResult: RouteResult) => {
    setSelectedRoute(routeResult.route);
    setCurrentScreen('map');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleHasStudentIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setHasStudentId(checked);
    
    // If unchecking, clear the student ID and deactivate discount
    if (!checked) {
      setStudentId('');
      setIsStudentDiscountActive(false);
    }
  }, []);

  const handleStudentIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStudentId(value);
    // Activate discount only if checkbox is checked and student ID has at least 6 characters
    setIsStudentDiscountActive(hasStudentId && value.length >= 6);
  }, [hasStudentId]);

  const calculateDiscountedFare = useCallback((originalFare: number): number => {
    if (isStudentDiscountActive) {
      return Math.round(originalFare * 0.55); // 45% discount means paying 55%
    }
    return originalFare;
  }, [isStudentDiscountActive]);

  // Toggle landmark category visibility
  const toggleLandmarkCategory = useCallback((category: string) => {
    setVisibleLandmarkCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Toggle all landmark categories
  const toggleAllLandmarks = useCallback(() => {
    const allCategories = Object.keys(landmarks);
    setVisibleLandmarkCategories(prev => 
      prev.length === allCategories.length ? [] : allCategories
    );
  }, []);

  // Theme classes
  const themeClasses = useMemo(() => ({
    // Backgrounds
    mainBg: isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    headerBg: isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white',
    inputBg: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200',
    buttonBg: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    primaryButtonBg: 'bg-blue-600 hover:bg-blue-700',
    
    // Text colors
    primaryText: isDarkMode ? 'text-white' : 'text-gray-900',
    secondaryText: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    
    // Interactive elements
    focusRing: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    shadow: isDarkMode ? 'shadow-xl shadow-gray-900/20' : 'shadow-xl',
    cardShadow: isDarkMode ? 'shadow-sm shadow-gray-900/20' : 'shadow-sm',
    
    // Special backgrounds
    loadingBg: isDarkMode ? 'bg-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100',
    resultsBg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    mapBg: isDarkMode ? 'bg-gray-800' : 'bg-gray-100',
    
    // Status colors (remain consistent across themes)
    successBg: 'bg-green-100 text-green-800',
    successText: 'text-green-600',
    infoBg: isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700',
    infoAccent: isDarkMode ? 'text-green-400' : 'text-green-600'
  }), [isDarkMode]);

  if (isSearching) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Full Screen Map */}
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={12}
          className="absolute inset-0 w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Dynamic map updates during search */}
          <DynamicMapUpdater
            fromLocation={fromLocation}
            toLocation={toLocation}
          />
          
          {/* Landmark markers */}
          <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
        </MapContainer>

        {/* Floating Loading Panel - With Pulse Animation */}
        <div className="absolute top-4 left-4 w-80 lg:w-96 z-[1000] animate-in slide-in-from-left duration-300">
          <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-lg animate-pulse">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Finding Routes
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {fromLocation.name} → {toLocation.name}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Loading Progress */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Searching Routes
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Using real Kathmandu bus network data
                    </div>
                  </div>
                </div>
                
                {/* Animated Progress Bar */}
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Search Steps */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Analyzing {allRoutes.length} bus routes
                  </span>
                </div>
                <div className="flex items-center space-x-3 animate-pulse" style={{animationDelay: '0.5s'}}>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Finding nearby bus stops
                  </span>
                </div>
                <div className="flex items-center space-x-3 animate-pulse" style={{animationDelay: '1s'}}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Calculating optimal routes...
                  </span>
                </div>
              </div>

              {/* Live Stats */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    Real-time Transit Data
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold text-blue-600">{allRoutes.length}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Routes</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-600">1491</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Stops</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-orange-600 animate-pulse">Live</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Data</div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  💡 Quick Tip
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  We analyze multiple route combinations to find you the fastest, cheapest, and most convenient options.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Search Stats - Top Right */}
        <div className="absolute top-4 right-4 z-[1000] animate-in slide-in-from-right duration-300 delay-200">
          <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 animate-pulse">●</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{allRoutes.length}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Routes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">1491</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stops</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Progress Indicator - Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-in slide-in-from-bottom duration-300 delay-400">
          <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin">
                <Bus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Analyzing Transit Network
                </div>
                <div className={`w-full rounded-full h-1.5 mt-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please wait...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Full Screen Map */}
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={12}
          className="absolute inset-0 w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Landmark markers */}
          <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
          
          {/* Dynamic map updates */}
          <DynamicMapUpdater
            fromLocation={fromLocation}
            toLocation={toLocation}
          />
        </MapContainer>

        {/* Floating Route Results Panel - With Animation */}
        <div className="absolute top-4 left-4 w-80 lg:w-[28rem] z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto animate-in slide-in-from-left duration-300">
          <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className={`p-1.5 rounded-lg transition-all hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Route Options
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {fromLocation.name} → {toLocation.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCurrentScreen('map')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              >
                Map View
              </button>
            </div>

            <div className="p-4">
              {routeResults.length === 0 ? (
                <div className="text-center py-8 animate-in fade-in duration-500">
                  <Bus className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>No Routes Found</h3>
                  <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No bus routes found connecting these locations.</p>
                  <button 
                    onClick={() => setCurrentScreen('home')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  >
                    Try Different Locations
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {routeResults.map((routeResult, index) => (
                    <div 
                      key={routeResult.id} 
                      className={`rounded-lg p-4 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer animate-in slide-in-from-bottom duration-300 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleRouteSelect(routeResult)}
                    >
                      {/* Route Stats */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{routeResult.duration}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-green-600">{routeResult.cost}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cost</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-orange-600">{routeResult.transfers}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Transfers</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>

                      {/* Route Info */}
                      <div className="mb-3">
                        <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {routeResult.route.name}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          From: {routeResult.nearbyStops.start.name} → To: {routeResult.nearbyStops.end.name}
                        </div>
                        {routeResult.route.operator && (
                          <div className="text-xs text-blue-600 mt-1">
                            Operator: {routeResult.route.operator.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Journey Steps */}
                      <div className="space-y-2">
                        {routeResult.steps.slice(0, 3).map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              {step.type === 'walk' && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                  <span className="text-xs">🚶</span>
                                </div>
                              )}
                              {step.type === 'bus' && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Bus className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {step.type === 'transfer' && (
                                <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                                  <RotateCw className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {step.description}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                  {step.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {routeResult.steps.length > 3 && (
                          <div className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{routeResult.steps.length - 3} more steps
                          </div>
                        )}
                      </div>

                      {/* Real-time Badge */}
                      <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-green-600" />
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                            Real-time Data • {allRoutes.length} routes available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Route Summary - Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-in slide-in-from-bottom duration-500 delay-300">
          <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{routeResults.length}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Options</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">
                    {routeResults.length > 0 ? routeResults[0].duration : 'N/A'}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fastest</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-600">
                    {routeResults.length > 0 ? routeResults[0].cost : 'N/A'}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cheapest</div>
                </div>
              </div>
              <button
                onClick={() => setCurrentScreen('home')}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'map') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Full Screen Map with Route Visualization */}
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={13}
          className="absolute inset-0 w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Landmark markers */}
          <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
          
          {/* Route Visualization */}
          {selectedRoute && (
            <>
              <RouteRenderer
                stopIds={selectedRoute.stops}
                lineColor={selectedRoute.lineColor}
                fitToScreen={true}
                showDetailedPopup={true}
              />
              <TransitRouteEngine
                route={selectedRoute}
                onRouteCalculated={() => {}}
                fitToScreen={true}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Route Details Panel - Top Left */}
        <div className="absolute top-4 left-4 w-80 z-[1000] animate-in slide-in-from-left duration-300">
          <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('results')}
                  className={`p-1.5 rounded-lg transition-all hover:scale-105 ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="bg-green-600 p-1.5 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Live Route Map
                </h1>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {selectedRoute ? (
                <div className="animate-in fade-in duration-500">
                  {/* Route Info */}
                  <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedRoute.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedRoute.stops.length} stops • Real-time tracking
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Route ID:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {selectedRoute.id}
                        </span>
                      </div>
                      {selectedRoute.operator && (
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Operator:</span>
                          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {selectedRoute.operator.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                        <span className="font-medium text-green-600">
                          {selectedRoute.isVerifiedRoute ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nearby Vehicles */}
                  <div>
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center text-sm`}>
                      <Bus className="w-4 h-4 mr-2 text-blue-600" />
                      Nearby Vehicles
                    </h3>
                    <div className="space-y-2">
                      <div className={`rounded-lg p-3 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bus className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                              Bus {Math.floor(Math.random() * 100)}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {fromLocation.name} → {toLocation.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {Math.floor(Math.random() * 10) + 2} min
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>away</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 animate-in fade-in duration-500">
                  <MapPin className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Select a route to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Map Controls - Right Side */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-[1000] animate-in slide-in-from-right duration-300 delay-200">
          <div className="flex flex-col space-y-2">
            <button 
              className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
                isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-700 border border-gray-200'
              } backdrop-blur-sm hover:bg-opacity-80`}
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button 
              className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
                isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-700 border border-gray-200'
              } backdrop-blur-sm hover:bg-opacity-80`}
            >
              <span className="text-lg font-bold">−</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Full Screen Map */}
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={12}
          className="absolute inset-0 w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Dynamic map updates */}
          <DynamicMapUpdater
            fromLocation={fromLocation}
            toLocation={toLocation}
          />
          
          {/* Landmark markers */}
          <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
        </MapContainer>

        {/* Floating Settings Panel - Replacing Search Panel */}
        <div className="absolute top-4 left-4 w-80 lg:w-96 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Settings
                </h1>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Theme Settings */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Theme Settings</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? (
                      <Moon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-600" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Student Discount Settings */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Student Discount</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hasStudentId"
                      checked={hasStudentId}
                      onChange={handleHasStudentIdChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasStudentId" className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      I have a Student ID
                    </label>
                  </div>
                  
                  {hasStudentId && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter Student ID (e.g., ST123456)"
                        value={studentId}
                        onChange={handleStudentIdChange}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Get 45% discount on all fares
                      </p>
                    </div>
                  )}
                  
                  {isStudentDiscountActive && (
                    <div className="flex items-center space-x-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">
                        45% Discount Active
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Engine Status */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Engine Status</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gaadi Engine</span>
                    <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Routes</span>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{allRoutes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bus Stops</span>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>1,491</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Preferences</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transport Type</span>
                    <select className={`text-xs px-2 py-1 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}>
                      <option>All Types</option>
                      <option>Bus Only</option>
                      <option>Microbus Only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Route Priority</span>
                    <select className={`text-xs px-2 py-1 rounded border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}>
                      <option>Fastest</option>
                      <option>Cheapest</option>
                      <option>Least Transfers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h2 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>About</h2>
                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  BatoBuddy v2.1.0 - Powered by Gaadi-Guide engine with {allRoutes.length} routes 
                  and 1,491 stops across Kathmandu Valley.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Panel - Top Right */}
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{allRoutes.length}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Routes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">1491</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stops</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">Live</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'livebuses') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Full Screen Map */}
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={12}
          className="absolute inset-0 w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Dynamic map updates */}
          <DynamicMapUpdater
            fromLocation={fromLocation}
            toLocation={toLocation}
          />
          
          {/* Landmark markers */}
          <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
        </MapContainer>

        {/* Floating Live Buses Panel - Replacing Search Panel */}
        <div className="absolute top-4 left-4 w-80 lg:w-96 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div className="bg-green-600 p-1.5 rounded-lg">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Live Buses
                </h1>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Available Routes */}
              <div>
                <h2 className={`text-sm font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Navigation className="w-4 h-4 mr-2 text-gray-500" />
                  Available Routes
                </h2>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Ring Road Route</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kalanki ↔ Koteshwor</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">6</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5 min</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>City Center</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ratnapark ↔ Airport</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">4</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>8 min</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Valley Express</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Thankot ↔ Dhulikhel</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">2</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>12 min</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Operators */}
              <div>
                <h2 className={`text-sm font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  Bus Operators
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Sajha Yatayat</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>8 routes</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>City Bus</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5 routes</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Express Bus</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>3 routes</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Local Service</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>12 routes</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                </div>
              </div>

              {/* Live Updates */}
              <div>
                <h2 className={`text-sm font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  Live Updates
                </h2>
                <div className="space-y-2">
                  <div className={`p-2 rounded-lg border-l-4 border-green-500 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Route 1 Update</div>
                    <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Next bus at Kalanki in 3 min</div>
                  </div>
                  <div className={`p-2 rounded-lg border-l-4 border-blue-500 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Route 2 Update</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Heavy traffic - 5 min delay</div>
                  </div>
                  <div className={`p-2 rounded-lg border-l-4 border-orange-500 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-800'}`}>Service Alert</div>
                    <div className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Route 3 limited service today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Panel - Top Right */}
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">12</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">28</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Routes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">Live</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Updates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Home Screen - Google Maps Style
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full Screen Map */}
      <MapContainer
        center={[27.7172, 85.3240]}
        zoom={12}
        className="absolute inset-0 w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Dynamic map updates as user types */}
        <DynamicMapUpdater
          fromLocation={fromLocation}
          toLocation={toLocation}
        />
        
        {/* Landmark markers */}
        <LandmarkMarkers visibleCategories={visibleLandmarkCategories} />
      </MapContainer>

      {/* Floating Search Panel - Top Left */}
      <div className="absolute top-4 left-4 w-80 lg:w-96 z-[1000]">
        <div className={`rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  BatoBuddy
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Powered by Gaadi-Guide</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCurrentScreen('settings')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* From Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-green-600" />
              <input
                type="text"
                placeholder="From (try: Baneshwor, Kalanki, Airport)"
                value={fromLocation.name}
                onChange={handleFromLocationChange}
                className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* To Input */}
            <div className="relative">
              <Navigation className="absolute left-3 top-3 w-4 h-4 text-red-600" />
              <input
                type="text"
                placeholder="To (try: Thamel, New Road, Lagankhel)"
                value={toLocation.name}
                onChange={handleToLocationChange}
                className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Intermediate Stops */}
            {intermediateStops.map((stop) => (
              <div key={stop.id} className="relative">
                <Plus className="absolute left-3 top-3 w-4 h-4 text-orange-500" />
                <input
                  type="text"
                  placeholder="Add stop (optional)"
                  value={stop.value}
                  onChange={handleIntermediateStopChange(stop.id)}
                  className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={() => removeIntermediateStop(stop.id)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={addIntermediateStop}
              className={`w-full py-2 px-3 border border-dashed rounded-lg transition-colors text-sm flex items-center justify-center space-x-2 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300' 
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-500'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add stop</span>
            </button>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                disabled={!fromLocation.name || !toLocation.name}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
                  (!fromLocation.name || !toLocation.name)
                    ? `${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Find Route</span>
              </button>
              
              <button
                onClick={() => setCurrentScreen('livebuses')}
                className="py-3 px-4 rounded-lg font-medium text-sm transition-colors bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <Bus className="w-4 h-4" />
                <span>Live</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Panel - Top Right */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className={`rounded-xl shadow-xl px-4 py-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{allRoutes.length}</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Routes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">1491</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stops</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">Live</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowLandmarkCategories(!showLandmarkCategories)}
                className={`w-8 h-8 rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                  showLandmarkCategories 
                    ? 'bg-purple-600 text-white' 
                    : `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} hover:bg-purple-600 hover:text-white`
                }`}
              >
                <span className="text-sm">🗺️</span>
              </button>
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Places</div>
            </div>
          </div>
        </div>
        
        {/* Landmark Category Buttons - Dropdown from Stats Panel */}
        {showLandmarkCategories && (
          <div className={`mt-2 rounded-xl shadow-xl p-3 ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm animate-slide-in-from-top`}>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(landmarkIcons).map(([category, config]) => (
                <button
                  key={category}
                  onClick={() => toggleLandmarkCategory(category)}
                  className={`w-12 h-12 rounded-lg shadow-md transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-xs font-medium border ${
                    visibleLandmarkCategories.includes(category)
                      ? 'border-white text-white scale-105'
                      : `${isDarkMode ? 'bg-gray-700/90 text-gray-300 border-gray-600' : 'bg-gray-100/90 text-gray-600 border-gray-300'} hover:border-gray-400`
                  }`}
                  style={{
                    backgroundColor: visibleLandmarkCategories.includes(category) ? config.color : undefined,
                    animationDelay: `${Object.keys(landmarkIcons).indexOf(category) * 30}ms`
                  }}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                >
                  <span className="text-lg leading-none">{config.icon}</span>
                  <span className="text-[10px] mt-0.5 leading-none capitalize">{category.slice(0,4)}</span>
                </button>
              ))}
            </div>
            
            {/* Control buttons */}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={toggleAllLandmarks}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  visibleLandmarkCategories.length === Object.keys(landmarks).length
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {visibleLandmarkCategories.length === Object.keys(landmarks).length ? 'Hide All' : 'Show All'}
              </button>
              <button
                onClick={() => setShowLandmarkCategories(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Recent Searches - Bottom Left */}
      {recentSearches.length > 0 && (
        <div className="absolute bottom-4 left-4 w-80 z-[1000]">
          <div className={`rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-900/95 border border-gray-700' : 'bg-white/95 border border-gray-200'} backdrop-blur-sm`}>
            <div className="p-4">
              <h3 className={`text-sm font-medium mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Recent Searches
              </h3>
              <div className="space-y-2">
                {recentSearches.slice(0, 3).map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleRecentSearchClick(search.from, search.to)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{search.from}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{search.to}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      {search.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Actions - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="flex flex-col space-y-3">
          <button className={`p-3 rounded-full shadow-xl transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800 text-yellow-400 border border-gray-600' : 'bg-white text-yellow-500 border border-gray-200'} backdrop-blur-sm`}>
            <Star className="w-5 h-5" />
          </button>
          <button className={`p-3 rounded-full shadow-xl transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800 text-blue-400 border border-gray-600' : 'bg-white text-blue-600 border border-gray-200'} backdrop-blur-sm`}>
            <Zap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Controls - Custom positioned */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-[1000]">
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => {
              // Zoom in logic here
            }}
            className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors ${
              isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-700 border border-gray-200'
            } backdrop-blur-sm hover:bg-opacity-80`}
          >
            <span className="text-lg font-bold">+</span>
          </button>
          <button 
            onClick={() => {
              // Zoom out logic here
            }}
            className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors ${
              isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-700 border border-gray-200'
            } backdrop-blur-sm hover:bg-opacity-80`}
          >
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>

      {/* Location Status Overlay */}
      {(fromLocation.name || toLocation.name) && (
        <div className="absolute top-20 right-4 space-y-2 z-[1000]">
          {fromLocation.name && (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-white text-xs shadow-lg ${fromLocation.coordinates ? 'bg-green-500/90' : 'bg-yellow-500/90'} backdrop-blur-sm`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>From: {fromLocation.name.substring(0, 15)}{fromLocation.name.length > 15 ? '...' : ''}</span>
            </div>
          )}
          {toLocation.name && (
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-white text-xs shadow-lg ${toLocation.coordinates ? 'bg-red-500/90' : 'bg-yellow-500/90'} backdrop-blur-sm`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>To: {toLocation.name.substring(0, 15)}{toLocation.name.length > 15 ? '...' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(BatoBuddyWithGaadiEngine);
