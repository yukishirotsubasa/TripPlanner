import { useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow } from "@react-google-maps/api";
import type { Spot } from "../../types";

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 25.033, lng: 121.5654 }; // 台北 101

interface MapViewProps {
  spots: Spot[];
  directions?: google.maps.DirectionsResult | null;
  onMapClick?: (lat: number, lng: number, placeId?: string) => void;
  selectedPlace?: Omit<Spot, "id"> | null;
  onCloseInfoWindow?: () => void;
  onAddPlace?: (place: Omit<Spot, "id">) => void;
}

export function MapView({ spots, directions, onMapClick, selectedPlace, onCloseInfoWindow, onAddPlace }: MapViewProps) {
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
        if (e.latLng && onMapClick) {
          const placeId = (e as any).placeId;
          if (placeId && e.stop) {
            e.stop(); // 阻止 Google 地圖預設的 POI InfoWindow 彈出
          }
          onMapClick(e.latLng.lat(), e.latLng.lng(), placeId);
        }
      }}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: true,
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
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.location}
          onCloseClick={onCloseInfoWindow}
        >
          <div className="flex flex-col gap-2 p-1 max-w-[200px]">
            <h3 className="font-bold text-surface-900 text-sm">{selectedPlace.name}</h3>
            <p className="text-xs text-surface-500">{selectedPlace.address}</p>
            <button
              onClick={() => onAddPlace?.(selectedPlace)}
              className="mt-1 w-full rounded-lg bg-primary-500 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-600 active:scale-95"
            >
              加入行程
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
