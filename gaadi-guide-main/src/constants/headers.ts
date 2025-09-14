import type { ReactNode } from "react";
import { createElement } from "react";
import { MessageSquareText, Map, Route, User } from "lucide-react";
import { SITE_SUGGESTION_REDIREECT, siteUrlMappings } from "./siteConfigs";

export interface IHeaderItem {
  name: string;
  path: string;
  icon: ReactNode;
  newTab?: boolean;
}

export const headerItems: IHeaderItem[] = [
  {
    name: "Explore Map",
    path: `/${siteUrlMappings.routes}`,
    icon: createElement(Map, { size: 16 }),
  },
  {
    name: "Find Routes",
    path: `/${siteUrlMappings.bus}`,
    icon: createElement(Route, { size: 16 }),
  },
  {
    name: "About BatoBuddy",
    path: `/${siteUrlMappings.about}`,
    icon: createElement(User, { size: 16 }),
  },
  {
    name: "Get Help",
    path: `${SITE_SUGGESTION_REDIREECT}`,
    newTab: true,
    icon: createElement(MessageSquareText, { size: 16 }),
  },
];
