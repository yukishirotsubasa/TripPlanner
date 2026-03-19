import { Fragment } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Clock, MapPinOff, Car } from "lucide-react";
import type { DayPlan, Spot } from "../../types";
import { SpotCard } from "./SpotCard";

interface SpotListProps {
  day: DayPlan;
  isReadonly: boolean;
  transitTimes?: Record<string, number>;
  onRemoveSpot: (dayId: string, spotId: string) => void;
  onDurationChange: (dayId: string, spotId: string, mins: number) => void;
  onReorder: (dayId: string, spots: Spot[]) => void;
  onStartTimeChange: (dayId: string, startTime: string) => void;
}

function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function SpotList({ 
  day, 
  isReadonly, 
  transitTimes = {}, 
  onRemoveSpot, 
  onDurationChange, 
  onReorder,
  onStartTimeChange
}: SpotListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.spots.findIndex((s) => s.id === active.id);
    const newIndex = day.spots.findIndex((s) => s.id === over.id);
    onReorder(day.id, arrayMove(day.spots, oldIndex, newIndex));
  }

  const startTimeMins = timeToMins(day.startTime || "08:00");
  
  // 計算每個景點的時間點
  const schedule: Array<{ arrival: string; departure: string }> = [];
  let currentMins = startTimeMins;

  for (let i = 0; i < day.spots.length; i++) {
    const spot = day.spots[i];
    const arrival = minsToTime(currentMins);
    currentMins += spot.durationMins;
    const departure = minsToTime(currentMins);
    schedule.push({ arrival, departure });

    // 加上到下一個點的路程時間
    const nextSpot = day.spots[i + 1];
    if (nextSpot) {
      const transitMins = transitTimes[`${spot.id}-${nextSpot.id}`] || 0;
      currentMins += transitMins;
    }
  }

  let transitTotal = 0;
  for (let i = 0; i < day.spots.length - 1; i++) {
    const key = `${day.spots[i].id}-${day.spots[i+1].id}`;
    if (transitTimes[key]) transitTotal += transitTimes[key];
  }

  const spotsTotal = day.spots.reduce((sum, s) => sum + s.durationMins, 0);
  const totalMins = spotsTotal + transitTotal;

  return (
    <div className="flex flex-col gap-3">
      {/* 行程設定 */}
      <div className="flex items-center justify-between gap-2 px-1">
        <label className="flex items-center gap-2 text-xs font-semibold text-surface-500">
          <Clock size={14} className="text-primary-500" />
          出發時間
          {isReadonly ? (
            <span className="rounded-lg bg-surface-100 px-2 py-1 text-surface-900">{day.startTime || "08:00"}</span>
          ) : (
            <input
              type="time"
              value={day.startTime || "08:00"}
              onChange={(e) => onStartTimeChange(day.id, e.target.value)}
              className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs font-medium text-surface-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          )}
        </label>
      </div>

      {/* 時間摘要 */}
      {day.spots.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/40 px-4 py-2.5 text-sm font-medium text-primary-700">
          <Clock size={15} />
          {day.spots.length} 個景點 · 預計 {Math.floor(totalMins / 60)} 小時 {totalMins % 60} 分鐘
        </div>
      )}

      {day.spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/50 py-12 text-surface-400">
          <MapPinOff size={32} className="text-surface-300" />
          <p className="text-sm">還沒有景點，{isReadonly ? "此行程尚無內容" : "從地圖搜尋並加入吧！"}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={day.spots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {day.spots.map((spot, index) => {
                const nextSpot = day.spots[index + 1];
                const transitMins = nextSpot ? transitTimes[`${spot.id}-${nextSpot.id}`] : null;

                return (
                  <Fragment key={spot.id}>
                    <SpotCard
                      spot={spot}
                      dayId={day.id}
                      isReadonly={isReadonly}
                      onRemove={onRemoveSpot}
                      onDurationChange={onDurationChange}
                      arrivalTime={schedule[index]?.arrival}
                      departureTime={schedule[index]?.departure}
                    />
                    {transitMins != null && (
                      <div className="my-0.5 flex flex-col items-center justify-center text-xs font-medium text-surface-400">
                        <div className="flex items-center gap-1.5 rounded-full bg-surface-100 px-3 py-1 shadow-sm">
                          <Car size={12} />
                          約 {transitMins} 分鐘
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
