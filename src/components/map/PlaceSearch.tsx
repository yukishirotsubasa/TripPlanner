import { useRef, useEffect } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Search, Plus } from "lucide-react";
import type { Spot } from "../../types";

interface PlaceSearchProps {
  onAddSpot: (spot: Omit<Spot, "id">) => void;
}

export function PlaceSearch({ onAddSpot }: PlaceSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  // 讓搜尋列在載入後自動 focus
  useEffect(() => {
    if (ready && inputRef.current) inputRef.current.focus();
  }, [ready]);

  async function handleSelect(description: string, placeId: string, mainText?: string, secText?: string) {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);
      onAddSpot({
        placeId,
        name: mainText || description.split(",")[0],
        address: secText || description,
        location: { lat, lng },
        durationMins: 60,
      });
      setValue("");
    } catch (error) {
      console.error("地理編碼失敗:", error);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          ref={inputRef}
          id="place-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="搜尋景點名稱或地址…"
          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-surface-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
        />
      </div>

      {status === "OK" && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-surface-200 bg-white shadow-xl">
          {data.map(({ place_id, description, structured_formatting }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description, place_id, structured_formatting?.main_text, structured_formatting?.secondary_text)}
              className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-surface-700 transition-colors hover:bg-primary-50"
            >
              <Plus size={14} className="shrink-0 text-primary-500" />
              <span className="truncate">{description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
