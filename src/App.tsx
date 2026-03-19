import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { Header } from "./components/layout/Header";
import { DayTabs } from "./components/itinerary/DayTabs";
import { SpotList } from "./components/itinerary/SpotList";
import { MapView } from "./components/map/MapView";
import { PlaceSearch } from "./components/map/PlaceSearch";
import { useItinerary } from "./hooks/useItinerary";
import { useShare } from "./hooks/useShare";

const LIBRARIES: ("places")[] = ["places"];

function TripEditor() {
  const { sharedItinerary, generateShareUrl } = useShare();

  const {
    itinerary,
    itineraries,
    isReadonly,
    activeDayId,
    activeDay,
    setActiveDayId,
    addDay,
    removeDay,
    addSpot,
    removeSpot,
    updateSpotDuration,
    reorderSpots,
    setTitle,
    createNewItinerary,
    switchItinerary,
    deleteItinerary,
    cloneAsNewItinerary,
  } = useItinerary(sharedItinerary);

  const [showCopied, setShowCopied] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
    language: "zh-TW",
  });

  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [transitTimes, setTransitTimes] = useState<Record<string, number>>({});
  const [selectedPlace, setSelectedPlace] = useState<Omit<import("./types").Spot, "id"> | null>(null);

  useEffect(() => {
    if (!isLoaded || !activeDay || activeDay.spots.length < 2) {
      setDirectionsResult(null);
      setTransitTimes({});
      return;
    }

    const service = new window.google.maps.DirectionsService();
    const spots = activeDay.spots;
    const origin = spots[0].location;
    const destination = spots[spots.length - 1].location;
    const waypoints = spots.slice(1, -1).map((s) => ({ location: s.location, stopover: true }));

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsResult(result);
          const newTimes: Record<string, number> = {};
          const legs = result.routes[0].legs;
          for (let i = 0; i < legs.length; i++) {
            if (legs[i].duration) {
              const mins = Math.ceil(legs[i].duration!.value / 60);
              newTimes[`${spots[i].id}-${spots[i + 1].id}`] = mins;
            }
          }
          setTransitTimes(newTimes);
        } else {
          console.error("Directions request failed:", status);
          setDirectionsResult(null);
          setTransitTimes({});
        }
      }
    );
  }, [isLoaded, activeDay]);

  async function handleMapClick(lat: number, lng: number, placeId?: string) {
    if (isReadonly || !activeDay) return;
    
    if (placeId) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        { placeId, fields: ["name", "formatted_address", "geometry", "place_id"] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
            setSelectedPlace({
              placeId: place.place_id || placeId,
              name: place.name || "未知景點",
              address: place.formatted_address || "",
              location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
              durationMins: 60,
            });
          }
        }
      );
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const result = response.results[0];
        const name = result.address_components[0]?.short_name || result.formatted_address.split(',')[0];
        setSelectedPlace({
          placeId: result.place_id,
          name: name,
          address: result.formatted_address,
          location: { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() },
          durationMins: 60,
        });
      }
    } catch (e) {
      console.error("Geocoding failed:", e);
    }
  }

  function handleAddSelectedPlace(place: Omit<import("./types").Spot, "id">) {
    if (!activeDay) return;
    addSpot(activeDay.id, place);
    setSelectedPlace(null);
  }

  function handleShare() {
    const url = generateShareUrl(itinerary);
    navigator.clipboard.writeText(url).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={itinerary?.title ?? ""}
        isReadonly={isReadonly}
        onShare={handleShare}
        onTitleChange={setTitle}
        itineraries={itineraries}
        activeItineraryId={itinerary?.id}
        onSwitchItinerary={switchItinerary}
        onCreateNewItinerary={createNewItinerary}
        onCloneAsNew={cloneAsNewItinerary}
        onDeleteItinerary={deleteItinerary}
      />

      <DayTabs
        days={itinerary.days}
        activeDayId={activeDayId}
        isReadonly={isReadonly}
        onSelect={setActiveDayId}
        onAdd={addDay}
        onRemove={removeDay}
      />

      {/* Main Content — RWD: stack on mobile, side-by-side on desktop */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Panel: Search + Spot List */}
        <div className="flex flex-col gap-4 overflow-y-auto p-4 lg:w-[440px] lg:border-r lg:border-surface-200">
          {!isReadonly && activeDay && (
            isLoaded ? (
              <PlaceSearch onAddSpot={(spot) => addSpot(activeDay.id, spot)} />
            ) : (
              <div className="h-10 w-full animate-pulse rounded-xl bg-surface-200" />
            )
          )}
          {activeDay && (
            <SpotList
              day={activeDay}
              isReadonly={isReadonly}
              transitTimes={transitTimes}
              onRemoveSpot={removeSpot}
              onDurationChange={updateSpotDuration}
              onReorder={reorderSpots}
            />
          )}
        </div>

        {/* Right Panel: Map */}
        <div className="relative flex-1">
          {/* Mobile map toggle */}
          <button
            onClick={() => setMapCollapsed(!mapCollapsed)}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-xl bg-white/90 px-4 py-1 text-xs font-medium text-surface-500 shadow-sm backdrop-blur lg:hidden"
          >
            {mapCollapsed ? "⬇ 展開地圖" : "⬆ 收合地圖"}
          </button>
          <div className={`h-64 lg:h-full ${mapCollapsed ? "hidden" : ""}`}>
            {loadError ? (
              <div className="flex h-full items-center justify-center bg-surface-100 text-surface-500">
                <p className="text-sm">地圖載入失敗，請檢查 API Key 設定</p>
              </div>
            ) : isLoaded ? (
              <MapView 
                spots={activeDay?.spots ?? []} 
                directions={directionsResult} 
                onMapClick={handleMapClick} 
                selectedPlace={selectedPlace}
                onCloseInfoWindow={() => setSelectedPlace(null)}
                onAddPlace={handleAddSelectedPlace}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-surface-100">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast: link copied */}
      {showCopied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce rounded-xl bg-surface-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          ✅ 分享連結已複製到剪貼簿！
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/TripPlanner">
      <Routes>
        <Route path="*" element={<TripEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
