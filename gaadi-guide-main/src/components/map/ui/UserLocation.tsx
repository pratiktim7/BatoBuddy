import { Loader, MapPin, MapPinOff } from "lucide-react";
import { Button } from "@/components/ui";

interface UserLocationProps {
  isSearchingLocation: boolean;
  getUserLocation: () => void;
}

const UserLocation: React.FC<UserLocationProps> = ({
  isSearchingLocation,
  getUserLocation,
}) => {
  const locationPermissionStatus = sessionStorage.getItem(
    "location-permission-denied"
  );

  return (
    <Button
      onClick={getUserLocation}
      icon={
        isSearchingLocation ? (
          <span className="animate-spin">
            <Loader size={18} />
          </span>
        ) : locationPermissionStatus === "true" ? (
          <MapPinOff size={18} />
        ) : (
          <MapPin size={18} />
        )
      }
      className="text-base md:text-xl"
      ariaLabel="Locate me"
    />
  );
};

export default UserLocation;
