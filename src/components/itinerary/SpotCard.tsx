import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock, Trash2, MapPin } from "lucide-react";
import type { Spot } from "../../types";

interface SpotCardProps {
  spot: Spot;
  dayId: string;
  isReadonly: boolean;
  onRemove: (dayId: string, spotId: string) => void;
  onDurationChange: (dayId: string, spotId: string, mins: number) => void;
}

export function SpotCard({ spot, dayId, isReadonly, onRemove, onDurationChange }: SpotCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: spot.id,
    disabled: isReadonly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-all ${
        isDragging
          ? "border-primary-300 shadow-lg ring-2 ring-primary-200"
          : "border-surface-200 hover:border-primary-200 hover:shadow-md"
      }`}
    >
      {/* Drag Handle */}
      {!isReadonly && (
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none rounded-lg p-1 text-surface-300 transition-colors hover:bg-surface-100 hover:text-surface-500 active:cursor-grabbing"
        >
          <GripVertical size={18} />
        </button>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 rounded-lg bg-primary-50 p-1 text-primary-500">
            <MapPin size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-surface-900">{spot.name}</h3>
            <p className="truncate text-xs text-surface-400">{spot.address}</p>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Clock size={12} />
          {isReadonly ? (
            <span>{spot.durationMins} 分鐘</span>
          ) : (
            <input
              type="number"
              min={0}
              value={spot.durationMins}
              onChange={(e) => onDurationChange(dayId, spot.id, Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-md border border-surface-200 px-2 py-0.5 text-xs outline-none focus:border-primary-400"
            />
          )}
          {!isReadonly && <span className="text-surface-400">分鐘</span>}
        </div>
      </div>

      {/* Delete */}
      {!isReadonly && (
        <button
          onClick={() => onRemove(dayId, spot.id)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-surface-300 opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
