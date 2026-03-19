import { Plus, X, Calendar } from "lucide-react";
import type { DayPlan } from "../../types";

interface DayTabsProps {
  days: DayPlan[];
  activeDayId: string;
  isReadonly: boolean;
  onSelect: (dayId: string) => void;
  onAdd: () => void;
  onRemove: (dayId: string) => void;
}

export function DayTabs({ days, activeDayId, isReadonly, onSelect, onAdd, onRemove }: DayTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-surface-200 bg-surface-50 px-3 py-2">
      {days.map((day) => {
        const isActive = day.id === activeDayId;
        return (
          <button
            key={day.id}
            onClick={() => onSelect(day.id)}
            className={`group relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-primary-700 shadow-sm ring-1 ring-primary-200"
                : "text-surface-500 hover:bg-white/60 hover:text-surface-700"
            }`}
          >
            <Calendar size={14} className={isActive ? "text-primary-500" : "text-surface-400"} />
            {day.date}
            {!isReadonly && days.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(day.id);
                }}
                className="ml-1 hidden cursor-pointer rounded-full p-0.5 text-surface-400 hover:bg-danger/10 hover:text-danger group-hover:inline-flex"
              >
                <X size={12} />
              </span>
            )}
          </button>
        );
      })}
      {!isReadonly && (
        <button
          id="btn-add-day"
          onClick={onAdd}
          className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary-500 transition-all hover:bg-primary-50"
        >
          <Plus size={14} /> 新增天數
        </button>
      )}
    </div>
  );
}
