import { createElement, type ReactNode } from "react";
import { Route, MapPinned, Search } from "lucide-react";
import { siteUrlMappings } from "./siteConfigs";

export interface ISidebarItem {
  key: number;
  name: string;
  icon: ReactNode;
  type?: string;
  url?: string;
}

export const sidebarItems: ISidebarItem[] = [
  {
    key: 0,
    name: "Routes",
    icon: createElement(Route, { size: 20 }),
    url: `/${siteUrlMappings.routes}`,
  },
  {
    key: 2,
    name: "Stops",
    icon: createElement(MapPinned, { size: 20 }),
    url: `/${siteUrlMappings.stops}`,
  },
  {
    key: 1,
    name: "Search",
    icon: createElement(Search, { size: 20 }),
    url: `/${siteUrlMappings.search}`,
  },
];
