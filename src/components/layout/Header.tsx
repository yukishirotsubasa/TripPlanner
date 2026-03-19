import { MapPin, Share2, Plane } from "lucide-react";

interface HeaderProps {
  title: string;
  isReadonly: boolean;
  onShare?: () => void;
  onTitleChange?: (title: string) => void;
}

export function Header({ title, isReadonly, onShare, onTitleChange }: HeaderProps) {
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

      <div className="flex items-center gap-2">
        {isReadonly && (
          <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            <MapPin size={12} /> 唯讀模式
          </span>
        )}
        {!isReadonly && onShare && (
          <button
            id="btn-share"
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-95"
          >
            <Share2 size={14} />
            分享行程
          </button>
        )}
      </div>
    </header>
  );
}
