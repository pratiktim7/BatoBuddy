import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, ArrowRight } from 'lucide-react';
import { LocationData } from './types/location';
import { loadGoogleMapsAPI } from './utils/googleMaps';

interface RouteInfo {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
}

interface GoogleMapProps {
  fromLocation?: LocationData;
  toLocation?: LocationData;
  isDarkMode?: boolean;
}

const GoogleMapComponent = ({ fromLocation, toLocation, isDarkMode = false }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Kathmandu locations with real coordinates
  const katmanduLocations: { [key: string]: { lat: number; lng: number } } = {
    'Ratna Park': { lat: 27.7015, lng: 85.3137 },
    'Thamel': { lat: 27.7114, lng: 85.3089 },
    'New Bus Park': { lat: 27.6966, lng: 85.3158 },
    'Patan Dhoka': { lat: 27.6729, lng: 85.3208 },
    'Tribhuvan Airport': { lat: 27.6966, lng: 85.3591 },
    'Durbar Marg': { lat: 27.7017, lng: 85.3196 },
    'Sundhara': { lat: 27.7008, lng: 85.3186 },
    'New Road': { lat: 27.7003, lng: 85.3144 },
  };

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Starting Google Maps API load...');
        
        // Load Google Maps API dynamically
        await loadGoogleMapsAPI();
        
        console.log('Google Maps API loaded successfully');
        
        if (!window.google || !window.google.maps) {
          console.error('Google Maps API failed to load - window.google not available');
          return;
        }

        console.log('Initializing map...');

        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: 27.7017, lng: 85.3200 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          polylineOptions: {
            strokeColor: '#e83431',
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });

        directionsRendererInstance.setMap(mapInstance);

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        setIsMapLoaded(true);
        
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };

    initMap();
  }, []);

  // Calculate and display route when locations change
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !fromLocation?.name || !toLocation?.name) {
      // Clear route info if locations are not available
      setRouteInfo(null);
      return;
    }

    // Use coordinates if available, otherwise try to find in hardcoded locations, or use geocoding
    let fromCoords = fromLocation.coordinates;
    let toCoords = toLocation.coordinates;

    // Fallback to hardcoded locations if coordinates not available
    if (!fromCoords) {
      fromCoords = katmanduLocations[fromLocation.name];
    }
    if (!toCoords) {
      toCoords = katmanduLocations[toLocation.name];
    }

    // If we still don't have coordinates, skip routing for now
    if (!fromCoords || !toCoords) return;

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(fromCoords.lat, fromCoords.lng),
      destination: new google.maps.LatLng(toCoords.lat, toCoords.lng),
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        
        // Extract distance and duration information
        const route = result.routes[0];
        if (route && route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance?.text || 'N/A',
            duration: leg.duration?.text || 'N/A',
            distanceValue: leg.distance?.value || 0,
            durationValue: leg.duration?.value || 0,
          });
        }
      } else {
        // Clear route info if route calculation fails
        setRouteInfo(null);
      }
    });
  }, [directionsService, directionsRenderer, fromLocation, toLocation, katmanduLocations]);

  return (
    <div className="w-full h-full bg-gray-100 overflow-hidden relative">
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Navigation className="w-8 h-8" style={{ color: '#e83431' }} />
            </div>
            <p className="text-gray-600 font-medium">Loading Google Maps...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ 
          opacity: isMapLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />

      {isMapLoaded && fromLocation?.name && toLocation?.name && (
        <div className={`absolute top-20 left-4 rounded-lg shadow-lg p-4 max-w-xs z-10 ${
          isDarkMode 
            ? 'bg-gray-800/95 backdrop-blur-sm' 
            : 'bg-white/95 backdrop-blur-sm'
        }`}>
          <div className={`text-sm font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Route: {fromLocation.name} → {toLocation.name}
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Powered by Google Maps
          </div>
        </div>
      )}

      {/* Distance and Duration Tile */}
      {isMapLoaded && routeInfo && (
        <div className={`absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm rounded-lg shadow-lg p-3 md:p-4 z-10 ${
          isDarkMode 
            ? 'bg-gray-800/95 backdrop-blur-sm' 
            : 'bg-white/95 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-center md:justify-start space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
              }`}>
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-center md:text-left">
                <div className={`text-lg md:text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{routeInfo.distance}</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Distance</div>
              </div>
            </div>
            
            <div className={`w-px h-10 ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-green-900/50' : 'bg-green-50'
              }`}>
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-center md:text-left">
                <div className={`text-lg md:text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{routeInfo.duration}</div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Duration</div>
              </div>
            </div>
            
            {/* Speed indicator for desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <div className={`w-px h-10 ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'
              }`}>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {routeInfo.distanceValue && routeInfo.durationValue 
                    ? `${Math.round((routeInfo.distanceValue / 1000) / (routeInfo.durationValue / 3600))} km/h`
                    : 'N/A'
                  }
                </div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Avg Speed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className={`absolute top-20 right-4 rounded-lg shadow-lg p-2 space-y-2 z-10 ${
        isDarkMode 
          ? 'bg-gray-800/95 backdrop-blur-sm' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 13) + 1)}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-200 shadow-sm ${
            isDarkMode
              ? 'bg-gray-700/80 hover:bg-gray-600 text-gray-300'
              : 'bg-white/80 hover:bg-white text-gray-600'
          }`}
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 13) - 1)}
          className={`w-8 h-8 rounded flex items-center justify-center transition-colors duration-200 shadow-sm ${
            isDarkMode
              ? 'bg-gray-700/80 hover:bg-gray-600 text-gray-300'
              : 'bg-white/80 hover:bg-white text-gray-600'
          }`}
        >
          <span className="text-lg font-bold">−</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleMapComponent;
