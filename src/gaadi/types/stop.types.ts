export interface IStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface IRoute {
  id: string;
  name: string;
  lineColor: string;
  stops: string[]; // Array of stop IDs, not stop objects
  operator?: string[];
  isVerifiedRoute?: boolean;
  details?: IBusStopsSummary;
}

interface IBusStopsSummary {
  distance_meter?: number;
  total_bus?: number;
  duration_mins?: number;
}
