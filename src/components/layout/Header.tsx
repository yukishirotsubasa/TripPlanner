import { MapPin, Share2, Plane, Plus, Copy, Trash2 } from "lucide-react";

interface HeaderProps {
  title: string;
  isReadonly: boolean;
  onShare?: () => void;
  onTitleChange?: (title: string) => void;
  itineraries?: import("../../types").Itinerary[];
  activeItineraryId?: string;
  onSwitchItinerary?: (id: string) => void;
  onCreateNewItinerary?: () => void;
  onCloneAsNew?: () => void;
  onDeleteItinerary?: (id: string) => void;
}

export function Header({ 
  title, isReadonly, onShare, onTitleChange,
  itineraries = [], activeItineraryId, onSwitchItinerary, onCreateNewItinerary, onCloneAsNew, onDeleteItinerary
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-surface-200 bg-white/80 px-4 py-3 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
          <Plane size={18} />
        </div>
        {isReadonly ? (
          <h1 className="text-lg font-bold text-surface-900">{title}</h1>
        ) : (
          <input
            id="itinerary-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold text-surface-900 outline-none transition-colors hover:border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
        {!isReadonly && itineraries.length > 0 && onSwitchItinerary && (
          <select 
            value={activeItineraryId}
            onChange={(e) => onSwitchItinerary(e.target.value)}
            className="rounded-lg border border-surface-200 bg-white px-2 py-1.5 text-sm font-medium text-surface-700 outline-none hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
          >
            {itineraries.map((itin) => (
              <option key={itin.id} value={itin.id}>{itin.title}</option>
            ))}
          </select>
        )}
        {!isReadonly && onCreateNewItinerary && (
          <button
            onClick={onCreateNewItinerary}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200 bg-white text-surface-500 shadow-sm transition-all hover:bg-surface-50 active:scale-95"
            title="新增行程"
          >
            <Plus size={16} />
          </button>
        )}
        {!isReadonly && onDeleteItinerary && activeItineraryId && (
          <button
            onClick={() => {
              if (window.confirm("確定要刪除目前這個行程嗎？此操作無法復原。")) {
                onDeleteItinerary(activeItineraryId);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 shadow-sm transition-all hover:bg-red-50 active:scale-95"
            title="刪除目前行程"
          >
            <Trash2 size={16} />
          </button>
        )}
        {isReadonly && onCloneAsNew && (
          <button
            onClick={onCloneAsNew}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-95"
          >
            <Copy size={14} />
            匯入為新行程
          </button>
        )}
        {isReadonly ? (
          <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            <MapPin size={12} /> 唯讀模式
          </span>
        ) : (
          onShare && (
            <button
              id="btn-share"
              onClick={onShare}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-95"
            >
              <Share2 size={14} />
              分享行程
            </button>
          )
        )}
      </div>
    </header>
  );
}
