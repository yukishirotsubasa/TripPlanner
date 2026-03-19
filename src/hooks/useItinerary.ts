import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import type { Itinerary, DayPlan, Spot, StorageState } from "../types";

const STORAGE_KEY = "trip-planner-itinerary";

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultItinerary(): Itinerary {
  const dayId = generateId();
  return {
    id: generateId(),
    title: format(new Date(), 'yyyy/MM/dd'),
    days: [{ id: dayId, date: "第 1 天", spots: [] }],
  };
}

function loadFromStorage(): StorageState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Migration from old single itinerary format
    if (!parsed.itineraries && parsed.id && parsed.days) {
      return {
        itineraries: [parsed as Itinerary],
        activeItineraryId: parsed.id
      };
    }
    return parsed as StorageState;
  } catch {
    return null;
  }
}

function saveToStorage(state: StorageState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("LocalStorage 寫入失敗，可能已滿載", e);
  }
}

/**
 * 行程狀態管理 Hook
 * @param initialData - 透過 URL 帶入的初始分享資料
 */
export function useItinerary(initialData: Itinerary | null = null) {
  const [readonlyData, setReadonlyData] = useState<Itinerary | null>(initialData);

  useEffect(() => {
    setReadonlyData(initialData);
  }, [initialData]);

  const isReadonly = !!readonlyData;

  const [storageState, setStorageState] = useState<StorageState>(() => {
    const loaded = loadFromStorage();
    if (loaded && loaded.itineraries.length > 0) {
      return loaded;
    }
    const def = createDefaultItinerary();
    return {
      itineraries: [def],
      activeItineraryId: def.id,
    };
  });

  const [activeDayId, setActiveDayId] = useState<string>("");

  // 若為唯讀模式，顯示分享的內容，不修改 main storageState
  const displayItinerary = isReadonly
    ? readonlyData
    : storageState.itineraries.find((i) => i.id === storageState.activeItineraryId) || storageState.itineraries[0];

  useEffect(() => {
    if (displayItinerary && displayItinerary.days.length > 0) {
      if (!displayItinerary.days.find((d) => d.id === activeDayId)) {
        setActiveDayId(displayItinerary.days[0].id);
      }
    }
  }, [displayItinerary, activeDayId]);

  // 永遠同步到 localStorage，除非是 initialData (唯讀模式) 時不主動覆寫
  useEffect(() => {
    if (!isReadonly) {
      saveToStorage(storageState);
    }
  }, [storageState, isReadonly]);

  const activeDay: DayPlan | undefined = displayItinerary?.days.find((d) => d.id === activeDayId);

  // Helper function to update the current active itinerary
  const updateCurrentItinerary = useCallback((updater: (prev: Itinerary) => Itinerary) => {
    setStorageState((prev) => {
      const current = prev.itineraries.find(i => i.id === prev.activeItineraryId);
      if (!current) return prev;
      const updated = updater(current);
      return {
        ...prev,
        itineraries: prev.itineraries.map(i => i.id === prev.activeItineraryId ? updated : i)
      };
    });
  }, []);

  // ── Multiple Itinerary ops ──
  const createNewItinerary = useCallback(() => {
    const newItin = createDefaultItinerary();
    setStorageState((prev) => ({
      itineraries: [...prev.itineraries, newItin],
      activeItineraryId: newItin.id,
    }));
  }, []);

  const switchItinerary = useCallback((id: string) => {
    setStorageState((prev) => ({ ...prev, activeItineraryId: id }));
  }, []);

  const deleteItinerary = useCallback((id: string) => {
    setStorageState((prev) => {
      let nextItineraries = prev.itineraries.filter((i) => i.id !== id);
      if (nextItineraries.length === 0) {
        nextItineraries = [createDefaultItinerary()];
      }
      return {
        itineraries: nextItineraries,
        activeItineraryId: prev.activeItineraryId === id ? nextItineraries[0].id : prev.activeItineraryId,
      };
    });
  }, []);

  const cloneAsNewItinerary = useCallback(() => {
    if (!readonlyData) return;
    const newItin: Itinerary = {
      ...readonlyData,
      id: generateId(),
      title: `${readonlyData.title} (匯入)`,
    };
    setStorageState((prev) => {
      const updated = {
        itineraries: [...prev.itineraries, newItin],
        activeItineraryId: newItin.id,
      };
      saveToStorage(updated);
      return updated;
    });
    setReadonlyData(null); // Clear readonly mode after cloning
  }, [readonlyData]);

  // ── Day ops ──
  const addDay = useCallback(() => {
    updateCurrentItinerary((prev) => {
      const newDay: DayPlan = {
        id: generateId(),
        date: `第 ${prev.days.length + 1} 天`,
        spots: [],
      };
      return { ...prev, days: [...prev.days, newDay] };
    });
  }, [updateCurrentItinerary]);

  const removeDay = useCallback(
    (dayId: string) => {
      updateCurrentItinerary((prev) => {
        const days = prev.days.filter((d) => d.id !== dayId);
        if (days.length === 0) {
          const fallback: DayPlan = { id: generateId(), date: "第 1 天", spots: [] };
          return { ...prev, days: [fallback] };
        }
        return { ...prev, days };
      });
      setActiveDayId((prevId) => {
        const remaining = displayItinerary?.days.filter((d) => d.id !== dayId) || [];
        if (remaining.find((d) => d.id === prevId)) return prevId;
        return remaining[0]?.id ?? "";
      });
    },
    [updateCurrentItinerary, displayItinerary]
  );

  // ── Spot ops ──
  const addSpot = useCallback(
    (dayId: string, spot: Omit<Spot, "id">) => {
      updateCurrentItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, spots: [...d.spots, { ...spot, id: generateId() }] } : d,
        ),
      }));
    },
    [updateCurrentItinerary]
  );

  const removeSpot = useCallback(
    (dayId: string, spotId: string) => {
      updateCurrentItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, spots: d.spots.filter((s) => s.id !== spotId) } : d,
        ),
      }));
    },
    [updateCurrentItinerary]
  );

  const updateSpotDuration = useCallback(
    (dayId: string, spotId: string, durationMins: number) => {
      updateCurrentItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId
            ? { ...d, spots: d.spots.map((s) => (s.id === spotId ? { ...s, durationMins } : s)) }
            : d,
        ),
      }));
    },
    [updateCurrentItinerary]
  );

  const reorderSpots = useCallback(
    (dayId: string, newSpots: Spot[]) => {
      updateCurrentItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, spots: newSpots } : d)),
      }));
    },
    [updateCurrentItinerary]
  );

  const setTitle = useCallback(
    (title: string) => {
      updateCurrentItinerary((prev) => ({ ...prev, title }));
    },
    [updateCurrentItinerary]
  );

  return {
    itinerary: displayItinerary,
    itineraries: storageState.itineraries,
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
  };
}
