import { useState } from 'react';
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
  X
} from 'lucide-react';
import GoogleMapComponent from './src/GoogleMapComponent';

interface IntermediateStop {
  id: string;
  value: string;
}

const BatoBuddyUI = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for demo
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
    },
    {
      id: 2,
      duration: '22 mins',
      cost: 'Rs. 20',
      transfers: 0,
      vehicles: ['Bus 15'],
      steps: [
        { type: 'walk', duration: '5 min', description: 'Walk to New Road Bus Stop' },
        { type: 'bus', duration: '17 min', description: 'Bus 15 → Thamel Direct', vehicle: 'Bus 15' }
      ]
    }
  ];

  const handleSearch = () => {
    if (fromLocation && toLocation) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setCurrentScreen('results');
      }, 2000);
    }
  };

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, { id: `stop-${Date.now()}`, value: '' }]);
  };

  const updateIntermediateStop = (id: string, value: string) => {
    setIntermediateStops(intermediateStops.map(stop => 
      stop.id === id ? { ...stop, value } : stop
    ));
  };

  const removeIntermediateStop = (id: string) => {
    setIntermediateStops(intermediateStops.filter(stop => stop.id !== id));
  };

  // Home Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BatoBuddy</h1>
              <p className="text-xs text-gray-500">Smart Transit Navigation</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentScreen('settings')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Location Access */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Plan Your Journey</h2>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          
          {/* From Location */}
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-600" />
              <input
                type="text"
                placeholder="From (Current location)"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Intermediate Stops */}
            {intermediateStops.map((stop) => (
              <div key={stop.id} className="relative">
                <Plus className="absolute left-3 top-3 w-5 h-5 text-orange-500" />
                <input
                  type="text"
                  placeholder="Add stop (optional)"
                  value={stop.value}
                  onChange={(e) => updateIntermediateStop(stop.id, e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeIntermediateStop(stop.id)}
                  className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={addIntermediateStop}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add intermediate stop</span>
            </button>

            {/* To Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-600" />
              <input
                type="text"
                placeholder="To (Destination)"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!fromLocation || !toLocation}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Find Best Route</span>
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Recent Searches
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => {
                  setFromLocation(search.from);
                  setToLocation(search.to);
                }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">{search.from}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{search.to}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  {search.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <Bus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Live Buses</span>
          </button>
          <button className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Loading Screen
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white rounded-full p-6 shadow-lg mb-4 mx-auto w-24 h-24 flex items-center justify-center">
          <div className="animate-spin">
            <Navigation className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Best Routes</h2>
        <p className="text-gray-600 mb-4">Analyzing real-time transport data...</p>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );

  // Results Screen
  const ResultsScreen = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">Route Options</h1>
            <p className="text-sm text-gray-500">{fromLocation} → {toLocation}</p>
          </div>
          <button 
            onClick={() => setCurrentScreen('map')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Map View
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {routeResults.map((route) => (
          <div key={route.id} className="bg-white rounded-xl shadow-sm p-5">
            {/* Route Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{route.duration}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{route.cost}</div>
                  <div className="text-xs text-gray-500">Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-orange-600">{route.transfers}</div>
                  <div className="text-xs text-gray-500">Transfers</div>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Select
              </button>
            </div>

            {/* Route Steps */}
            <div className="space-y-3">
              {route.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {step.type === 'walk' && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">🚶</span>
                      </div>
                    )}
                    {step.type === 'bus' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bus className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {step.type === 'transfer' && (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <RotateCw className="w-4 h-4 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{step.description}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {step.duration}
                      </span>
                    </div>
                    {step.vehicle && (
                      <div className="text-xs text-blue-600 mt-1">Vehicle: {step.vehicle}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Info */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Real-time Update</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Next {route.vehicles[0]} arrives in 3 minutes at your stop
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Map Screen
  const MapScreen = () => (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setCurrentScreen('results')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="font-semibold text-gray-900">Live Map</h1>
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Google Maps Integration */}
      <div className="p-4">
        <div className="transform hover:scale-[1.01] transition-transform duration-300 shadow-xl rounded-2xl overflow-hidden">
          <GoogleMapComponent fromLocation={fromLocation} toLocation={toLocation} />
        </div>
      </div>

      {/* Live Vehicle Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Nearby Vehicles</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-medium">Bus 12</div>
                <div className="text-sm text-gray-500">Ratna Park → Sundhara</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">2 min away</div>
              <div className="text-xs text-gray-500">Next stop: Ratna Park</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="w-8 h-8 text-red-600" />
              <div>
                <div className="font-medium">Bus 15</div>
                <div className="text-sm text-gray-500">New Road → Thamel</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-orange-600">8 min away</div>
              <div className="text-xs text-gray-500">Next stop: New Road</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Settings Screen
  const SettingsScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
          </button>
          <h1 className="font-semibold text-gray-900">Settings</h1>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Preferred Transport</span>
              <select className="bg-gray-100 rounded px-3 py-1 text-sm">
                <option>All Types</option>
                <option>Bus Only</option>
                <option>Train Only</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Route Priority</span>
              <select className="bg-gray-100 rounded px-3 py-1 text-sm">
                <option>Fastest</option>
                <option>Cheapest</option>
                <option>Least Transfers</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Screen Router
  const renderScreen = () => {
    if (isSearching) return <LoadingScreen />;
    
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'results': return <ResultsScreen />;
      case 'map': return <MapScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl">
      {renderScreen()}
    </div>
  );
};

export default BatoBuddyUI;