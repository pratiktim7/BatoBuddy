import { useState, useCallback } from 'react';
import { MapPin, Navigation, Clock, Bus, Search, Settings, Star, Plus, X, ChevronRight, Moon, Sun } from 'lucide-react';
import OpenStreetMapComponent from './OpenStreetMapComponent';
import SimpleLocationAutocomplete from './SimpleLocationAutocomplete';
import { LocationData, IntermediateStop as IntermediateStopType } from './types/location';

const BatoBuddyClean = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [fromLocation, setFromLocation] = useState<LocationData>({ name: '' });
  const [toLocation, setToLocation] = useState<LocationData>({ name: '' });
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStopType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMapSelectionMode, setIsMapSelectionMode] = useState(false);
  const [mapSelectionType, setMapSelectionType] = useState<'from' | 'to'>('from');

  // Mock data
  const recentSearches = [
    { from: 'Ratna Park', to: 'Thamel', time: '15 min' },
    { from: 'New Bus Park', to: 'Patan Dhoka', time: '25 min' },
    { from: 'Tribhuvan Airport', to: 'Durbar Marg', time: '30 min' }
  ];

  const routeResults = [
    {
      id: 1,
      duration: '18 mins',
      cost: 'Rs. 25',
      transfers: 1,
      vehicles: ['Bus 12', 'Local Bus'],
      steps: [
        { type: 'walk', duration: '3 min', description: 'Walk to Ratna Park Bus Stop' },
        { type: 'bus', duration: '10 min', description: 'Bus 12 → Sundhara', vehicle: 'Bus 12' },
        { type: 'transfer', duration: '2 min', description: 'Transfer at Sundhara' },
        { type: 'bus', duration: '3 min', description: 'Local Bus → Thamel', vehicle: 'Local Bus' }
      ]
    }
  ];

  const handleSearch = useCallback(() => {
    if (fromLocation.name && toLocation.name) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setCurrentScreen('results');
      }, 2000);
    }
  }, [fromLocation.name, toLocation.name]);

  const addIntermediateStop = useCallback(() => {
    setIntermediateStops(prev => [...prev, { 
      id: `stop-${Date.now()}`, 
      location: { name: '' } 
    }]);
  }, []);

  const updateIntermediateStop = useCallback((id: string, location: LocationData) => {
    setIntermediateStops(prev => prev.map(stop => 
      stop.id === id ? { ...stop, location } : stop
    ));
  }, []);

  const removeIntermediateStop = useCallback((id: string) => {
    setIntermediateStops(prev => prev.filter(stop => stop.id !== id));
  }, []);

  const selectRecentSearch = useCallback((from: string, to: string) => {
    setFromLocation({ name: from });
    setToLocation({ name: to });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Handle map location selection
  const handleMapLocationSelect = useCallback(async (location: { lat: number; lng: number }, type: 'from' | 'to') => {
    console.log(`Map location selected for ${type}:`, location);
    
    // Try to get location name from reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const locationName = data.display_name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        
        if (type === 'from') {
          setFromLocation({ name: locationName, coordinates: location });
        } else {
          setToLocation({ name: locationName, coordinates: location });
        }
      } else {
        // Fallback to coordinates if reverse geocoding fails
        const coordName = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        if (type === 'from') {
          setFromLocation({ name: coordName, coordinates: location });
        } else {
          setToLocation({ name: coordName, coordinates: location });
        }
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      const coordName = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      if (type === 'from') {
        setFromLocation({ name: coordName, coordinates: location });
      } else {
        setToLocation({ name: coordName, coordinates: location });
      }
    }
    
    // Exit selection mode
    setIsMapSelectionMode(false);
  }, []);

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className={`min-h-screen ${
        isDarkMode 
          ? 'bg-gray-900 text-white dark' 
          : 'bg-white text-gray-900 light'
      }`}>
        {/* Mobile Layout (default) */}
        <div className="lg:hidden">
          <div className={`mx-auto shadow-xl min-h-screen ${
            // Mobile: max-w-md, Tablet: max-w-2xl 
            'max-w-md md:max-w-2xl'
          } ${
            isDarkMode 
              ? 'bg-gray-900 text-white' 
              : 'bg-white text-gray-900'
          }`}>
            <div className={`shadow-sm px-6 py-4 ${
              isDarkMode 
                ? 'bg-gray-800' 
                : 'bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>BatoBuddy</h1>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Smart Transit Navigation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('settings')}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Settings className={`w-5 h-5 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Mobile Journey Planning */}
              <div className={`rounded-xl shadow-sm p-4 border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Plan Your Journey</h2>
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="space-y-4">
                  {/* From Location */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <SimpleLocationAutocomplete
                        value={fromLocation.name}
                        onChange={(name: string, coordinates?: { lat: number; lng: number }) => {
                          console.log('FROM location onChange called:', { name, coordinates });
                          setFromLocation({ name, coordinates });
                        }}
                        placeholder="From (Current location)"
                        icon={<MapPin className="w-5 h-5 text-green-600" />}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <button
                      onClick={() => {
                        console.log('FROM map selection button clicked');
                        setMapSelectionType('from');
                        setIsMapSelectionMode(true);
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Select from map"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Intermediate Stops */}
                  {intermediateStops.map((stop) => (
                    <div key={stop.id} className="relative">
                      <SimpleLocationAutocomplete
                        value={stop.location.name}
                        onChange={(name: string, coordinates?: { lat: number; lng: number }) => 
                          updateIntermediateStop(stop.id, { name, coordinates })
                        }
                        placeholder="Add stop (optional)"
                        icon={<Plus className="w-5 h-5 text-orange-500" />}
                        isDarkMode={isDarkMode}
                        className="pr-12"
                      />
                      <button
                        onClick={() => removeIntermediateStop(stop.id)}
                        className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-red-500 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addIntermediateStop}
                    className={`w-full py-2 border-2 border-dashed rounded-lg flex items-center justify-center space-x-2 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-400 hover:border-blue-400 hover:text-blue-400' 
                        : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add intermediate stop</span>
                  </button>

                  {/* To Location */}
                  <SimpleLocationAutocomplete
                    value={toLocation.name}
                    onChange={(name: string, coordinates?: { lat: number; lng: number }) => 
                      setToLocation({ name, coordinates })
                    }
                    placeholder="To (Destination)"
                    icon={<MapPin className="w-5 h-5 text-red-600" />}
                    isDarkMode={isDarkMode}
                  />

                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    disabled={!fromLocation.name || !toLocation.name}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Best Route</span>
                  </button>
                </div>
              </div>

              {/* Recent Searches and Quick Actions - Tablet Grid */}
              <div className="md:grid md:grid-cols-2 md:gap-6 space-y-6 md:space-y-0">
                {/* Recent Searches */}
                <div className={`rounded-xl shadow-sm p-4 border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`font-semibold mb-3 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Clock className={`w-5 h-5 mr-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => selectRecentSearch(search.from, search.to)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{search.from}</span>
                            <ChevronRight className={`w-4 h-4 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <span className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{search.to}</span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'text-gray-400 bg-gray-800' 
                            : 'text-gray-500 bg-white'
                        }`}>
                          {search.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <button className={`w-full rounded-xl shadow-sm p-4 text-center hover:shadow-md border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <Bus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Live Buses</span>
                  </button>
                  <button className={`w-full rounded-xl shadow-sm p-4 text-center hover:shadow-md border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Favorites</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          {/* Left Sidebar */}
          <div className={`w-96 flex-shrink-0 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl overflow-y-auto custom-scrollbar`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>BatoBuddy</h1>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Smart Transit Navigation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button 
                    onClick={() => setCurrentScreen('settings')}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Settings className={`w-5 h-5 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Journey Planning */}
            <div className="p-6 space-y-6">
              <div className={`rounded-xl shadow-sm p-6 border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Plan Your Journey</h2>
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="space-y-4">
                  {/* From Location */}
                  <SimpleLocationAutocomplete
                    value={fromLocation.name}
                    onChange={(name: string, coordinates?: { lat: number; lng: number }) => 
                      setFromLocation({ name, coordinates })
                    }
                    placeholder="From (Current location)"
                    icon={<MapPin className="w-5 h-5 text-green-600" />}
                    isDarkMode={isDarkMode}
                  />

                  {/* Intermediate Stops */}
                  {intermediateStops.map((stop) => (
                    <div key={stop.id} className="relative">
                      <SimpleLocationAutocomplete
                        value={stop.location.name}
                        onChange={(name: string, coordinates?: { lat: number; lng: number }) => 
                          updateIntermediateStop(stop.id, { name, coordinates })
                        }
                        placeholder="Add stop (optional)"
                        icon={<Plus className="w-5 h-5 text-orange-500" />}
                        isDarkMode={isDarkMode}
                        className="pr-12"
                      />
                      <button
                        onClick={() => removeIntermediateStop(stop.id)}
                        className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-red-500 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addIntermediateStop}
                    className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center space-x-2 ${
                      isDarkMode 
                        ? 'border-gray-500 text-gray-400 hover:border-blue-400 hover:text-blue-400' 
                        : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add intermediate stop</span>
                  </button>

                  {/* To Location */}
                  <SimpleLocationAutocomplete
                    value={toLocation.name}
                    onChange={(name: string, coordinates?: { lat: number; lng: number }) => 
                      setToLocation({ name, coordinates })
                    }
                    placeholder="To (Destination)"
                    icon={<MapPin className="w-5 h-5 text-red-600" />}
                    isDarkMode={isDarkMode}
                  />

                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    disabled={!fromLocation.name || !toLocation.name}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Find Best Route</span>
                  </button>
                </div>
              </div>

              {/* Recent Searches - Desktop */}
              <div className={`rounded-xl shadow-sm p-4 border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-3 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Clock className={`w-5 h-5 mr-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => selectRecentSearch(search.from, search.to)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-600 hover:bg-gray-500' 
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{search.from}</span>
                          <ChevronRight className={`w-4 h-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{search.to}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDarkMode 
                          ? 'text-gray-300 bg-gray-700' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {search.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="grid grid-cols-1 gap-3">
                <button className={`rounded-xl shadow-sm p-4 text-center hover:shadow-md border flex items-center space-x-3 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}>
                  <Bus className="w-8 h-8 text-blue-600" />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Live Buses</span>
                </button>
                <button className={`rounded-xl shadow-sm p-4 text-center hover:shadow-md border flex items-center space-x-3 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}>
                  <Star className="w-8 h-8 text-yellow-500" />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Favorites</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Map */}
          <div className="flex-1">
            <OpenStreetMapComponent 
              fromLocation={fromLocation} 
              toLocation={toLocation} 
              isDarkMode={isDarkMode}
              onLocationSelect={handleMapLocationSelect}
              isSelectionMode={isMapSelectionMode}
              selectionType={mapSelectionType}
            />
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (isSearching) {
    return (
      <div className={`max-w-md mx-auto shadow-xl min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gray-900 dark' 
          : 'bg-white light'
      }`}>
        <div className="text-center">
          <div className={`rounded-full p-6 shadow-lg mb-4 mx-auto w-24 h-24 flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gray-800' 
              : 'bg-white'
          }`}>
            <div className="animate-spin">
              <Navigation className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Finding Best Routes</h2>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Analyzing real-time transport data...</p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (currentScreen === 'results') {
    return (
      <div className={`min-h-screen ${
        isDarkMode 
          ? 'bg-gray-900 text-white dark' 
          : 'bg-white text-gray-900 light'
      }`}>
        {/* Mobile Results Layout */}
        <div className="lg:hidden">
          <div className={`max-w-md mx-auto shadow-xl min-h-screen ${
            isDarkMode 
              ? 'bg-gray-900 text-white' 
              : 'bg-white text-gray-900'
          }`}>
            <div className={`shadow-sm px-6 py-4 ${
              isDarkMode 
                ? 'bg-gray-800' 
                : 'bg-white'
            }`}>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className={`p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className={`w-5 h-5 rotate-180 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
                <div className="flex-1">
                  <h1 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Route Options</h1>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{fromLocation.name} → {toLocation.name}</p>
                </div>
                <button 
                  onClick={() => setCurrentScreen('map')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Map View
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {routeResults.map((route) => (
                <div key={route.id} className={`rounded-xl shadow-sm p-5 border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{route.duration}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{route.cost}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Cost</div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Results Layout */}
        <div className="hidden lg:flex h-screen">
          {/* Left Sidebar - Route Results */}
          <div className={`w-96 flex-shrink-0 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl overflow-y-auto custom-scrollbar`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentScreen('home')}
                  className={`p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className={`w-5 h-5 rotate-180 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </button>
                <div className="flex-1">
                  <h1 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Route Options</h1>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{fromLocation.name} → {toLocation.name}</p>
                </div>
              </div>
            </div>

            {/* Route Results */}
            <div className="p-6 space-y-4">
              {routeResults.map((route) => (
                <div key={route.id} className={`rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{route.duration}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold text-green-600">{route.cost}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Cost</div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Select Route
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Map */}
          <div className="flex-1">
            <OpenStreetMapComponent 
              fromLocation={fromLocation} 
              toLocation={toLocation} 
              isDarkMode={isDarkMode}
              onLocationSelect={handleMapLocationSelect}
              isSelectionMode={isMapSelectionMode}
              selectionType={mapSelectionType}
            />
          </div>
        </div>
      </div>
    );
  }

  // Map Screen
  if (currentScreen === 'map') {
    return (
      <div className="w-full min-h-screen relative">
        {/* Header with absolute positioning */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentScreen('results')}
              className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
            <h1 className="font-semibold text-gray-900">Live Map</h1>
            <button className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Full screen map */}
        <div className="w-full h-screen">
          <OpenStreetMapComponent 
            fromLocation={fromLocation} 
            toLocation={toLocation} 
            isDarkMode={isDarkMode}
            onLocationSelect={handleMapLocationSelect}
            isSelectionMode={isMapSelectionMode}
            selectionType={mapSelectionType}
          />
        </div>
      </div>
    );
  }

  // Settings Screen
  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gray-900 text-white dark' 
        : 'bg-white text-gray-900 light'
    }`}>
      {/* Mobile Settings Layout */}
      <div className="lg:hidden">
        <div className={`max-w-md mx-auto shadow-xl min-h-screen ${
          isDarkMode 
            ? 'bg-gray-900 text-white' 
            : 'bg-white text-gray-900'
        }`}>
          <div className={`shadow-sm px-6 py-4 ${
            isDarkMode 
              ? 'bg-gray-800' 
              : 'bg-white'
          }`}>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentScreen('home')}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className={`w-5 h-5 rotate-180 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <h1 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Settings</h1>
            </div>
          </div>
          
          <div className="p-4">
            <div className={`rounded-xl shadow-sm p-4 border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Preferred Transport</span>
                  <select className={`rounded px-3 py-1 text-sm ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-100 border-gray-200 text-gray-900'
                  }`}>
                    <option>All Types</option>
                    <option>Bus Only</option>
                    <option>Tampo Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Settings Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Sidebar - Settings */}
        <div className={`w-96 flex-shrink-0 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-xl overflow-y-auto custom-scrollbar`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentScreen('home')}
                className={`p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className={`w-5 h-5 rotate-180 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              </button>
              <h1 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Settings</h1>
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="p-6 space-y-6">
            <div className={`rounded-xl shadow-sm p-6 border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Preferred Transport</span>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Choose your preferred mode of transportation</p>
                  </div>
                  <select className={`rounded-lg px-4 py-2 text-sm border ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}>
                    <option>All Types</option>
                    <option>Bus Only</option>
                    <option>Tampo Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Dark Mode</span>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Toggle between light and dark themes</p>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-500' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Map or placeholder */}
        <div className="flex-1">
          <OpenStreetMapComponent 
            fromLocation={fromLocation} 
            toLocation={toLocation} 
            isDarkMode={isDarkMode}
            onLocationSelect={handleMapLocationSelect}
            isSelectionMode={isMapSelectionMode}
            selectionType={mapSelectionType}
          />
        </div>
      </div>
    </div>
  );
};

export default BatoBuddyClean;
