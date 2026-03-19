import { useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import type { Spot } from "../../types";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 25.033, lng: 121.5654 }; // 台北 101

interface MapViewProps {
  spots: Spot[];
  directions?: google.maps.DirectionsResult | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export function MapView({ spots, directions, onMapClick }: MapViewProps) {
  const [, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
    if (!directions && spots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      spots.forEach((s) => bounds.extend(s.location));
      map.fitBounds(bounds, 60);
    }
  };

  const center = spots.length > 0 ? spots[0].location : DEFAULT_CENTER;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onClick={(e) => {
        if (e.latLng && onMapClick) onMapClick(e.latLng.lat(), e.latLng.lng());
      }}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      }}
    >
      {directions ? (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#3b82f6",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      ) : (
        spots.map((spot, idx) => (
          <Marker
            key={spot.id}
            position={spot.location}
            label={{ text: String(idx + 1), className: "font-bold text-white text-xs" }}
          />
        ))
      )}
    </GoogleMap>
  );
}
