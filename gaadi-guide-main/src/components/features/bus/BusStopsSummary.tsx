import { Link } from "react-router-dom";
import type React from "react";
import type { IRoute } from "@/types/route.types";
import { Eye, Map } from "lucide-react";
import { siteUrlMappings } from "@/constants/siteConfigs";
import { Button, LineHeading, VerificationBadge } from "@/components/ui";
import BusStopsList from "./BusStopsList";

interface BusStopsSummaryProps {
  route: IRoute;
  priorityStop?: string;
}

const BusStopsSummary: React.FC<BusStopsSummaryProps> = ({
  route,
  priorityStop,
}) => {
  return (
    <section className="p-4 rounded-lg bg-surface/75">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <LineHeading lineColor={route?.lineColor} name={route?.name} />

        <VerificationBadge
          showReportText={false}
          isVerified={route.isVerifiedRoute || false}
        />
      </div>

      <BusStopsList
        routeId={route?.id}
        stopsArray={route?.stops}
        priorityStop={priorityStop}
        itemsToShow={3}
      />

      <div className="flex flex-wrap items-center flex-row gap-3 mt-8">
        <Link
          className="block w-fit"
          to={`/${siteUrlMappings.routes}?route=${route?.id}`}
        >
          <Button
            ariaLabel="View in map"
            title="View in Map"
            className="text-xs"
            icon={<Map size={16} />}
            variant="accent"
          />
        </Link>

        <Link
          className="block w-fit"
          to={`/${siteUrlMappings.bus}/${route?.id}`}
        >
          <Button
            ariaLabel="View All Stops"
            title="View All Stops"
            className="text-xs"
            icon={<Eye size={16} />}
            variant="secondary"
          />
        </Link>
      </div>
    </section>
  );
};

export default BusStopsSummary;
