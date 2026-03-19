import { useState, useEffect, useCallback } from "react";
import type { Itinerary, DayPlan, Spot } from "../types";

const STORAGE_KEY = "trip-planner-itinerary";

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultItinerary(): Itinerary {
  const dayId = generateId();
  return {
    id: generateId(),
    title: "我的旅行計畫",
    days: [{ id: dayId, date: "第 1 天", spots: [] }],
  };
}

function loadFromStorage(): Itinerary | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Itinerary;
  } catch {
    return null;
  }
}

function saveToStorage(itinerary: Itinerary) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
  } catch (e) {
    console.error("LocalStorage 寫入失敗，可能已滿載", e);
  }
}

/**
 * 行程狀態管理 Hook
 * @param initialData - 透過 URL 帶入的初始分享資料
 */
export function useItinerary(initialData: Itinerary | null = null) {
  // 移除唯讀限制
  const isReadonly = false;

  const [itinerary, setItinerary] = useState<Itinerary>(() => {
    if (initialData) return initialData;
    return loadFromStorage() ?? createDefaultItinerary();
  });

  const [activeDayId, setActiveDayId] = useState<string>(itinerary.days[0]?.id ?? "");

  // 當 initialData 在 URL 被解析後非同步傳入時，覆寫目前狀態
  useEffect(() => {
    if (initialData) {
      setItinerary(initialData);
      setActiveDayId(initialData.days[0]?.id ?? "");
    }
  }, [initialData]);

  // 永遠同步到 localStorage
  useEffect(() => {
    saveToStorage(itinerary);
  }, [itinerary]);

  const activeDay: DayPlan | undefined = itinerary.days.find((d) => d.id === activeDayId);

  // ── Day ops ──
  const addDay = useCallback(() => {
    setItinerary((prev) => {
      const newDay: DayPlan = {
        id: generateId(),
        date: `第 ${prev.days.length + 1} 天`,
        spots: [],
      };
      return { ...prev, days: [...prev.days, newDay] };
    });
  }, []);

  const removeDay = useCallback(
    (dayId: string) => {
      setItinerary((prev) => {
        const days = prev.days.filter((d) => d.id !== dayId);
        if (days.length === 0) {
          const fallback: DayPlan = { id: generateId(), date: "第 1 天", spots: [] };
          return { ...prev, days: [fallback] };
        }
        return { ...prev, days };
      });
      setActiveDayId((prev) => {
        const remaining = itinerary.days.filter((d) => d.id !== dayId);
        if (remaining.find((d) => d.id === prev)) return prev;
        return remaining[0]?.id ?? "";
      });
    },
    [itinerary.days],
  );

  // ── Spot ops ──
  const addSpot = useCallback(
    (dayId: string, spot: Omit<Spot, "id">) => {
      setItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, spots: [...d.spots, { ...spot, id: generateId() }] } : d,
        ),
      }));
    },
    [],
  );

  const removeSpot = useCallback(
    (dayId: string, spotId: string) => {
      setItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, spots: d.spots.filter((s) => s.id !== spotId) } : d,
        ),
      }));
    },
    [],
  );

  const updateSpotDuration = useCallback(
    (dayId: string, spotId: string, durationMins: number) => {
      setItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId
            ? { ...d, spots: d.spots.map((s) => (s.id === spotId ? { ...s, durationMins } : s)) }
            : d,
        ),
      }));
    },
    [],
  );

  const reorderSpots = useCallback(
    (dayId: string, newSpots: Spot[]) => {
      setItinerary((prev) => ({
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, spots: newSpots } : d)),
      }));
    },
    [],
  );

  const setTitle = useCallback(
    (title: string) => {
      setItinerary((prev) => ({ ...prev, title }));
    },
    [],
  );

  return {
    itinerary,
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
  };
}
