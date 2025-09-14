export interface LocationData {
  name: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IntermediateStop {
  id: string;
  location: LocationData;
}
