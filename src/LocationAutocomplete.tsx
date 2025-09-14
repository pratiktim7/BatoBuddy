import { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import { loadGoogleMapsAPI } from './utils/googleMaps';

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, placeId?: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  icon: React.ReactNode;
  isDarkMode?: boolean;
  className?: string;
}

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder, 
  icon, 
  isDarkMode = false,
  className = ""
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Initialize Google Places services
  useEffect(() => {
    const initServices = async () => {
      try {
        // Load Google Maps API dynamically
        await loadGoogleMapsAPI();
        
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteService.current = new google.maps.places.AutocompleteService();
          
          // Create a hidden map for PlacesService
          const hiddenMapDiv = document.createElement('div');
          mapRef.current = new google.maps.Map(hiddenMapDiv);
          placesService.current = new google.maps.places.PlacesService(mapRef.current);
        }
      } catch (error) {
        console.error('Failed to load Google Maps API for autocomplete:', error);
      }
    };

    initServices();
  }, []);

  // Search for location suggestions
  const searchLocations = (query: string) => {
    if (!autocompleteService.current || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    
    const request = {
      input: query,
      componentRestrictions: { country: 'np' }, // Restrict to Nepal
      types: ['establishment', 'geocode'], // Include businesses and addresses
    };

    autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
      setIsLoading(false);
      
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    });
  };

  // Get coordinates for selected place
  const getPlaceDetails = (placeId: string, description: string) => {
    if (!placesService.current) {
      onChange(description, placeId);
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['geometry', 'name', 'formatted_address']
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
        const coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        onChange(description, placeId, coordinates);
      } else {
        onChange(description, placeId);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim()) {
      searchLocations(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    getPlaceDetails(suggestion.place_id, suggestion.description);
    setSuggestions([]);
    setIsOpen(false);
  };

  const clearInput = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 w-5 h-5">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && suggestions.length > 0 && setIsOpen(true)}
          onBlur={handleBlur}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} ${value ? 'pr-12' : 'pr-4'} py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
          }`}
        />
        
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-5 h-5">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-lg shadow-lg border max-h-60 overflow-y-auto custom-scrollbar ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-opacity-50 flex items-start space-x-3 ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {suggestion.structured_formatting.main_text}
                </div>
                {suggestion.structured_formatting.secondary_text && (
                  <div className={`text-sm truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
