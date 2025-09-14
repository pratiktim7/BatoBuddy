import { memo } from 'react';
import { MapPin, Navigation, Settings, Clock, ChevronRight, Search, Bus, Star, Plus } from 'lucide-react';
import InputField from './InputField';
import IntermediateStopInput from './IntermediateStopInput';

interface IntermediateStop {
  id: string;
  value: string;
}

interface HomeScreenProps {
  fromLocation: string;
  toLocation: string;
  intermediateStops: IntermediateStop[];
  onFromLocationChange: (value: string) => void;
  onToLocationChange: (value: string) => void;
  onAddIntermediateStop: () => void;
  onUpdateIntermediateStop: (id: string, value: string) => void;
  onRemoveIntermediateStop: (id: string) => void;
  onSearch: () => void;
  onNavigateToSettings: () => void;
  onSelectRecentSearch: (from: string, to: string) => void;
}

const HomeScreen = memo(({ 
  fromLocation, 
  toLocation, 
  intermediateStops,
  onFromLocationChange,
  onToLocationChange,
  onAddIntermediateStop,
  onUpdateIntermediateStop,
  onRemoveIntermediateStop,
  onSearch,
  onNavigateToSettings,
  onSelectRecentSearch
}: HomeScreenProps) => {
  // Mock data for demo
  const recentSearches = [
    { from: 'Ratna Park', to: 'Thamel', time: '15 min' },
    { from: 'New Bus Park', to: 'Patan Dhoka', time: '25 min' },
    { from: 'Tribhuvan Airport', to: 'Durbar Marg', time: '30 min' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BatoBuddy</h1>
              <p className="text-xs text-gray-500">Smart Transit Navigation</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToSettings}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Location Access */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">Plan Your Journey</h2>
            <div className="p-2 rounded-full bg-blue-600">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* From Location */}
          <div className="space-y-5">
            <InputField
              value={fromLocation}
              onChange={onFromLocationChange}
              placeholder="From (Current location)"
              icon={<MapPin className="w-5 h-5 text-green-600" />}
            />

            {/* Intermediate Stops */}
            {intermediateStops.map((stop) => (
              <IntermediateStopInput
                key={stop.id}
                stop={stop}
                onUpdate={onUpdateIntermediateStop}
                onRemove={onRemoveIntermediateStop}
              />
            ))}

            <button
              onClick={onAddIntermediateStop}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add intermediate stop</span>
            </button>

            {/* To Location */}
            <InputField
              value={toLocation}
              onChange={onToLocationChange}
              placeholder="To (Destination)"
              icon={<MapPin className="w-5 h-5 text-blue-600" />}
            />

            {/* Search Button */}
            <button
              onClick={onSearch}
              disabled={!fromLocation || !toLocation}
              className="w-full bg-blue-600 text-white py-5 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              <Search className="w-6 h-6" />
              <span className="text-lg">Find Best Route</span>
            </button>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            Recent Searches
          </h3>
          <div className="space-y-3">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => onSelectRecentSearch(search.from, search.to)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">{search.from}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{search.to}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {search.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl">
            <Bus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Live Buses</span>
          </button>
          <button className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;
