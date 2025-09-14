import { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';

interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  importance?: number;
}

interface SimpleLocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder: string;
  icon: React.ReactNode;
  isDarkMode?: boolean;
  className?: string;
}

const SimpleLocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder, 
  icon, 
  isDarkMode = false,
  className = ""
}: SimpleLocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number>();

  // Predefined Kathmandu locations for quick suggestions
  const katmanduLocations = [
    { name: 'Ratna Park', coordinates: { lat: 27.7015, lng: 85.3137 } },
    { name: 'Thamel', coordinates: { lat: 27.7114, lng: 85.3089 } },
    { name: 'New Bus Park', coordinates: { lat: 27.6966, lng: 85.3158 } },
    { name: 'Patan Dhoka', coordinates: { lat: 27.6729, lng: 85.3208 } },
    { name: 'Tribhuvan Airport', coordinates: { lat: 27.6966, lng: 85.3591 } },
    { name: 'Durbar Marg', coordinates: { lat: 27.7017, lng: 85.3196 } },
    { name: 'Sundhara', coordinates: { lat: 27.7008, lng: 85.3186 } },
    { name: 'New Road', coordinates: { lat: 27.7003, lng: 85.3144 } },
    { name: 'Basantapur Durbar Square', coordinates: { lat: 27.7042, lng: 85.3075 } },
    { name: 'Pashupatinath Temple', coordinates: { lat: 27.7106, lng: 85.3489 } },
    { name: 'Swayambhunath', coordinates: { lat: 27.7149, lng: 85.2900 } },
    { name: 'Boudhanath Stupa', coordinates: { lat: 27.7215, lng: 85.3616 } },
    { name: 'Koteshwor', coordinates: { lat: 27.6784, lng: 85.3473 } },
    { name: 'Balaju', coordinates: { lat: 27.7328, lng: 85.3024 } },
    { name: 'Kalanki', coordinates: { lat: 27.6934, lng: 85.2808 } },
  ];

  // Search for location suggestions
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // First, show local suggestions that match (for quick access to popular places)
    const localSuggestions = katmanduLocations
      .filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(location => ({
        place_id: `local_${location.name.replace(/\s+/g, '_')}`,
        display_name: `${location.name}, Kathmandu, Nepal`,
        lat: location.coordinates.lat.toString(),
        lon: location.coordinates.lng.toString(),
        name: location.name
      }));

    // Show local suggestions immediately if any match
    if (localSuggestions.length > 0) {
      setSuggestions(localSuggestions);
      setIsOpen(true);
    }

    // Then search globally with a delay for better performance
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        // Global search using Nominatim API - works worldwide
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&accept-language=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Process global search results
          const globalSuggestions = data.map((item: any) => ({
            place_id: item.place_id.toString(),
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            name: item.name || item.display_name.split(',')[0],
            type: item.type || 'location',
            importance: item.importance || 0
          }));
          
          // Combine local and global suggestions
          const allSuggestions = [...localSuggestions];
          
          // Add global suggestions that don't duplicate local ones
          globalSuggestions.forEach((global: LocationSuggestion) => {
            const isDuplicate = allSuggestions.some(local => 
              local.name?.toLowerCase().includes(global.name?.toLowerCase() || '') ||
              global.display_name.toLowerCase().includes(local.name?.toLowerCase() || '')
            );
            if (!isDuplicate && global.name) {
              allSuggestions.push({
                ...global,
                name: global.name
              });
            }
          });
          
          // Sort by relevance (local first, then by importance)
          const sortedSuggestions = allSuggestions.sort((a, b) => {
            // Local suggestions first
            if (a.place_id.startsWith('local_') && !b.place_id.startsWith('local_')) return -1;
            if (!a.place_id.startsWith('local_') && b.place_id.startsWith('local_')) return 1;
            
            // Then by importance for global results
            const aImportance = (a as any).importance || 0;
            const bImportance = (b as any).importance || 0;
            return bImportance - aImportance;
          });
          
          setSuggestions(sortedSuggestions.slice(0, 10)); // Limit to 10 suggestions
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        // Keep local suggestions if global search fails
        if (localSuggestions.length === 0) {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300); // Reduced delay for more responsive typing
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
    const coordinates = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    
    const displayName = suggestion.name || suggestion.display_name.split(',')[0];
    onChange(displayName, coordinates);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
              className={`w-full text-left px-4 py-3 hover:bg-opacity-50 flex items-start space-x-3 border-b last:border-b-0 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 border-gray-700' 
                  : 'hover:bg-gray-50 border-gray-100'
              }`}
            >
              <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                suggestion.place_id.startsWith('local_') 
                  ? 'text-blue-500' 
                  : (suggestion.type === 'city' || suggestion.type === 'town') 
                    ? 'text-green-500'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {suggestion.name || suggestion.display_name.split(',')[0]}
                </div>
                <div className={`text-sm truncate ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {suggestion.display_name}
                </div>
                {suggestion.place_id.startsWith('local_') && (
                  <div className="text-xs text-blue-500 font-medium mt-1">Popular Location</div>
                )}
                {suggestion.type && !suggestion.place_id.startsWith('local_') && (
                  <div className={`text-xs font-medium mt-1 capitalize ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {suggestion.type.replace('_', ' ')}
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

export default SimpleLocationAutocomplete;
