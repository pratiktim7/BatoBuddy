import { memo } from 'react';
import { Plus, X } from 'lucide-react';

interface IntermediateStopInputProps {
  stop: {
    id: string;
    value: string;
  };
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

const IntermediateStopInput = memo(({ stop, onUpdate, onRemove }: IntermediateStopInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(stop.id, e.target.value);
  };

  const handleRemove = () => {
    onRemove(stop.id);
  };

  return (
    <div className="relative">
      <Plus className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
      <input
        type="text"
        placeholder="Add stop (optional)"
        value={stop.value}
        onChange={handleChange}
        className="w-full pl-14 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleRemove}
        className="absolute right-4 top-4 w-5 h-5 text-gray-400 hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

IntermediateStopInput.displayName = 'IntermediateStopInput';

export default IntermediateStopInput;
