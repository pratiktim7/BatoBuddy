import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// \data
import stops_data from "@/data/stops_data.json";
// \types
import type { IRouteSegment } from "@/utils/searchRouteSegments";
import type { IStop } from "@/types/stop.types";
// \settings
import {
  SITE_TOP_TITLE,
  SITE_BASE_URL,
  siteUrlMappings,
} from "@/constants/siteConfigs";
// \components
import { Heading, BottomSheet, ContentPanel } from "@/components/ui";
import { BusStopMarker } from "@/components/map/ui";
import { SidebarLayout } from "@/components/layouts";
import {
  SearchForm,
  SearchRouteSegmentsList,
} from "@/components/features/search";
import MapRendererLayer from "@/components/map/MapRendererLayer";
import { RouteRenderer } from "@/components/map/renderer";
import { FlyToStopHandler } from "@/components/map/handers";

const SearchPage = () => {
  const [segments, setSegments] = useState<IRouteSegment[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchParams] = useSearchParams();
  const [paramsStop, setParamsStop] = useState<IStop | null>(null);
  const stop = searchParams.get("stop");

  useEffect(() => {
    if (!stop) return;

    const stopData = stops_data.find((item: IStop) => item.id === stop);

    if (!stopData) {
      console.info("[W] Invalid stop id found in url");
      return;
    }

    setParamsStop(stopData);
  }, [stop]);

  return (
    <>
      <Helmet>
        <title>Search {SITE_TOP_TITLE}</title>
        <link
          rel="canonical"
          href={`${SITE_BASE_URL}/${siteUrlMappings.search}`}
        />
      </Helmet>

      <SidebarLayout>
        <ContentPanel>
          <SearchForm
            setShowResults={setShowResults}
            setSegments={setSegments}
          />
        </ContentPanel>

        {showResults && segments && (
          <BottomSheet onClose={() => setShowResults(false)}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎉</span>
              <Heading className="text-text" level={2}>
                Found your route!
              </Heading>
            </div>

            <div className="bg-surface-1/50 p-4 rounded-xl border border-accent/20 mb-4">
              <p className="text-offText text-sm">
                Your BatoBuddy has mapped out the best way to get there. 
                Follow the highlighted route on the map! 🗺️
              </p>
            </div>

            <SearchRouteSegmentsList
              mode="search"
              headingLevel={3}
              segments={segments}
            />
          </BottomSheet>
        )}
      </SidebarLayout>

      <MapRendererLayer>
        {segments && (
          <>
            {segments?.map((segment, i) => (
              <RouteRenderer
                key={`${segment.id}${i}`}
                stopIds={segment?.stops}
                fitToScreen={false}
                lineColor={segment?.lineColor}
                showDetailedPopup={false}
              />
            ))}
          </>
        )}

        {paramsStop && !segments && (
          <BusStopMarker
            stopId={paramsStop.id}
            stopName={paramsStop.name}
            position={[paramsStop.lat, paramsStop.lng]}
            lineColor="#bc2c36"
          />
        )}

        <FlyToStopHandler />
      </MapRendererLayer>
    </>
  );
};

export default SearchPage;
