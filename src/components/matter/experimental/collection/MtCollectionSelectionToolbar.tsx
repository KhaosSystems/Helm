import { CalendarDays, Tag, Trash2, UserRound } from 'lucide-react';
import { useMtCollection } from './MtCollectionContext';

/**
 * Floating selection toolbar that appears at the bottom of the collection when one or more
 * entries are selected. Provides bulk-action controls.
 *
 * Disabled stubs: Status, Assignee, Dates, Tags
 * Active action: Delete (immediate, no confirmation)
 */
export function MtCollectionSelectionToolbar() {
  const { selectedIds, clearSelection, onDeleteEntries } = useMtCollection();

  if (selectedIds.size === 0) {
    return null;
  }

  const handleDelete = async () => {
    await onDeleteEntries?.(new Set(selectedIds));
    clearSelection();
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-lg border border-[#3a3a3a] bg-[#1c1c1c] shadow-xl text-sm select-none">
      {/* Count */}
      <span className="text-text-muted pr-2 tabular-nums whitespace-nowrap">{selectedIds.size} selected</span>

      <div className="w-px h-4 bg-[#3a3a3a] mx-1" />

      {/* Disabled bulk-action stubs */}
      <button
        type="button"
        disabled
        title="Set status (coming soon)"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-text-muted opacity-40 cursor-not-allowed transition-colors"
      >
        <span className="inline-block w-3 h-3 rounded-full border border-current" />
        <span>Status</span>
      </button>

      <button
        type="button"
        disabled
        title="Set assignee (coming soon)"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-text-muted opacity-40 cursor-not-allowed transition-colors"
      >
        <UserRound size={13} />
        <span>Assignee</span>
      </button>

      <button
        type="button"
        disabled
        title="Set dates (coming soon)"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-text-muted opacity-40 cursor-not-allowed transition-colors"
      >
        <CalendarDays size={13} />
        <span>Dates</span>
      </button>

      <button
        type="button"
        disabled
        title="Set tags (coming soon)"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-text-muted opacity-40 cursor-not-allowed transition-colors"
      >
        <Tag size={13} />
        <span>Tags</span>
      </button>

      <div className="w-px h-4 bg-[#3a3a3a] mx-1" />

      {/* Delete — active, no confirmation */}
      <button
        type="button"
        onClick={handleDelete}
        title="Delete selected"
        className="flex items-center justify-center w-7 h-7 rounded text-red-500 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={14} />
      </button>

      {/* Dismiss */}
      <button
        type="button"
        onClick={clearSelection}
        title="Clear selection"
        className="flex items-center justify-center w-7 h-7 rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors ml-0.5"
      >
        ✕
      </button>
    </div>
  );
}
