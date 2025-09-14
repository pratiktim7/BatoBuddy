import { Button, Heading, SearchableCombobox } from "@/components/ui";
import stopsData from "@/data/stops_data.json";
import useSearchByStop from "@/hooks/useSearchByStop";
import type { IRouteSegment } from "@/utils/searchRouteSegments";
import { Loader, Search } from "lucide-react";
import type React from "react";

interface ISearchForm {
  setShowResults: (value: boolean) => void;
  setSegments: (value: IRouteSegment[] | null) => void;
}

const SearchForm: React.FC<ISearchForm> = ({ setSegments, setShowResults }) => {
  const {
    selectedStartStop,
    selectedDestinationStop,
    setSelectedStartStop,
    setSelectedDestinationStop,
    handleSearchByStop,
    isSearchingForStops,
  } = useSearchByStop();

  async function handleSearch() {
    const segments = await handleSearchByStop();

    if (segments && segments.segments) {
      setSegments(segments.segments);
      setShowResults(true);
    }
  }

  return (
    <div className="bg-gradient-to-br from-surface-1 to-surface-2 p-6 rounded-2xl border border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🚌</span>
        <Heading className="text-text" level={2}>
          Where would you like to go?
        </Heading>
      </div>

      <div className="space-y-4 mb-6">
        <SearchableCombobox
          label="📍 Starting from"
          selected={selectedStartStop}
          onChange={(opt) => setSelectedStartStop(opt)}
          options={stopsData.map((stp) => ({ id: stp.id, name: stp.name }))}
          placeholder="e.g. Sundhara, New Road, Ratnapark..."
          className="bg-surface-2/50 border-accent/30 rounded-xl"
        />

        <SearchableCombobox
          label="🎯 Going to"
          selected={selectedDestinationStop}
          onChange={(opt) => setSelectedDestinationStop(opt)}
          options={stopsData.map((stp) => ({ id: stp.id, name: stp.name }))}
          placeholder="e.g. Kalanki, Patan, Bhaktapur..."
          className="bg-surface-2/50 border-accent/30 rounded-xl"
        />
      </div>

      <Button
        icon={
          isSearchingForStops ? (
            <span className="animate-spin">
              <Loader size={18} />
            </span>
          ) : (
            <Search size={18} />
          )
        }
        title={isSearchingForStops ? "Finding your route..." : "Let's go! 🚀"}
        ariaLabel="search routes"
        className="w-full text-sm font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchForm;
