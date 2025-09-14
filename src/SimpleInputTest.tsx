import { useState, useCallback } from 'react';
import { MapPin, Plus, X } from 'lucide-react';

interface IntermediateStop {
  id: string;
  value: string;
}

const SimpleInputTest = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([]);

  const addIntermediateStop = useCallback(() => {
    setIntermediateStops(prev => [...prev, { id: `stop-${Date.now()}`, value: '' }]);
  }, []);

  const updateIntermediateStop = useCallback((id: string, value: string) => {
    setIntermediateStops(prev => prev.map(stop => 
      stop.id === id ? { ...stop, value } : stop
    ));
  }, []);

  const removeIntermediateStop = useCallback((id: string) => {
    setIntermediateStops(prev => prev.filter(stop => stop.id !== id));
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-6 space-y-4">
      <h2 className="text-xl font-bold">BatoBuddy - Input Test</h2>
      
      {/* From Location */}
      <div className="relative">
        <MapPin className="absolute left-4 top-4 w-5 h-5 text-green-600" />
        <input
          key="from-input"
          type="text"
          placeholder="From (Current location)"
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Intermediate Stops */}
      {intermediateStops.map((stop) => (
        <div key={stop.id} className="relative">
          <Plus className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
          <input
            type="text"
            placeholder="Add stop (optional)"
            value={stop.value}
            onChange={(e) => updateIntermediateStop(stop.id, e.target.value)}
            className="w-full pl-14 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => removeIntermediateStop(stop.id)}
            className="absolute right-4 top-4 w-5 h-5 text-gray-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addIntermediateStop}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add intermediate stop</span>
      </button>

      {/* To Location */}
      <div className="relative">
        <MapPin className="absolute left-4 top-4 w-5 h-5 text-blue-600" />
        <input
          key="to-input"
          type="text"
          placeholder="To (Destination)"
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p><strong>From:</strong> {fromLocation || '(empty)'}</p>
        <p><strong>Stops:</strong> {intermediateStops.map(s => s.value).join(', ') || '(none)'}</p>
        <p><strong>To:</strong> {toLocation || '(empty)'}</p>
        <p className="text-xs text-gray-500 mt-2">
          Total stops: {intermediateStops.length}
        </p>
      </div>
    </div>
  );
};

export default SimpleInputTest;
