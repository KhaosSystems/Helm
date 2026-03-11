import React from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function areColumnOrdersEqual(a: Record<string, string[]>, b: Record<string, string[]>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    const aValues = a[key] ?? [];
    const bValues = b[key] ?? [];
    if (aValues.length !== bValues.length) {
      return false;
    }
    for (let index = 0; index < aValues.length; index += 1) {
      if (aValues[index] !== bValues[index]) {
        return false;
      }
    }
  }

  return true;
}

export interface BoardDndColumn {
  key: string;
  label: string;
  [extraKey: string]: unknown;
}

/**
 * Shared board DnD hook used by both the board and plan layouts.
 *
 * Manages column ordering, drag state, and cross-column movement.
 * The consumer provides columns with their entries and a callback
 * for handling cross-column moves (e.g. updating status or dates).
 */
export function useBoardDnd<TColumn extends BoardDndColumn>({
  columns,
  entriesByColumn,
  onCrossColumnMove,
  onPositionChange,
  disableSameColumnReorder,
  onReorderBlocked,
}: {
  /** Column definitions (board groups or plan weeks). */
  columns: TColumn[];
  /** Map from column key → entries in that column. */
  entriesByColumn: Map<string, any[]>;
  /** Called when a card is dropped in a different column. */
  onCrossColumnMove?: (
    activeId: string,
    entry: any,
    sourceColumnKey: string,
    destinationColumnKey: string,
    destinationColumn: TColumn,
  ) => void;
  /** Called when a card is dropped to persist its new position. */
  onPositionChange?: (activeId: string, entry: any, newPosition: number) => void;
  /** When true, within-column reordering is disabled (cross-column moves still work). */
  disableSameColumnReorder?: boolean;
  /** Called when a within-column reorder was attempted but blocked by `disableSameColumnReorder`. */
  onReorderBlocked?: () => void;
}) {
  const [columnOrder, setColumnOrder] = React.useState<Record<string, string[]>>({});
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const dragStartColumnKeyRef = React.useRef<string | null>(null);
  /** Tracks which column the dragged card is currently in (updated by onDragOver). */
  const dragCurrentColumnKeyRef = React.useRef<string | null>(null);
  const isDraggingRef = React.useRef(false);
  const prevDisableSameColumnReorderRef = React.useRef(disableSameColumnReorder);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Sync column order from external data, but skip during an active drag
  // to prevent the effect from reverting the optimistic onDragOver reorder.
  React.useEffect(() => {
    if (isDraggingRef.current) return;

    const prevDisabled = prevDisableSameColumnReorderRef.current;
    prevDisableSameColumnReorderRef.current = !!disableSameColumnReorder;

    setColumnOrder((previous) => {
      const next: Record<string, string[]> = {};

      columns.forEach((column) => {
        const currentIds = (entriesByColumn.get(column.key) ?? []).map((e: any) => String(e?.id ?? ''));
        // When sort-rules are active (disableSameColumnReorder), always use the
        // data-driven order so that changing sort rules re-sorts immediately.
        // Also use data-driven order when transitioning away from sort rules,
        // so the stale sort-rule order is discarded.
        if (disableSameColumnReorder || prevDisabled) {
          next[column.key] = currentIds;
        } else {
          const previousIds = previous[column.key] ?? [];
          const preserved = previousIds.filter((id) => currentIds.includes(id));
          const appended = currentIds.filter((id) => !preserved.includes(id));
          next[column.key] = [...preserved, ...appended];
        }
      });

      return areColumnOrdersEqual(previous, next) ? previous : next;
    });
  }, [columns, disableSameColumnReorder, entriesByColumn]);

  const entryById = React.useMemo(() => {
    const map = new Map<string, any>();
    entriesByColumn.forEach((entries) => {
      entries.forEach((entry) => map.set(String(entry?.id ?? ''), entry));
    });
    return map;
  }, [entriesByColumn]);

  const orderedColumns = React.useMemo(
    () =>
      columns.map((column) => {
        const currentIds = (entriesByColumn.get(column.key) ?? []).map((e: any) => String(e?.id ?? ''));
        const orderedIds = columnOrder[column.key] ?? currentIds;
        return { column, entryIds: orderedIds };
      }),
    [columnOrder, columns, entriesByColumn],
  );

  const defaultEntryIdsByColumn = React.useMemo(() => {
    const map = new Map<string, string[]>();
    orderedColumns.forEach(({ column, entryIds }) => map.set(column.key, entryIds));
    return map;
  }, [orderedColumns]);

  const entryColumnById = React.useMemo(() => {
    const map = new Map<string, string>();
    columns.forEach((column) => {
      const ids =
        columnOrder[column.key] ?? (entriesByColumn.get(column.key) ?? []).map((e: any) => String(e?.id ?? ''));
      ids.forEach((id) => map.set(id, column.key));
    });
    return map;
  }, [columns, columnOrder, entriesByColumn]);

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id ?? '');
      setActiveDragId(activeId || null);
      isDraggingRef.current = true;
      const col = activeId ? (entryColumnById.get(activeId) ?? null) : null;
      dragStartColumnKeyRef.current = col;
      dragCurrentColumnKeyRef.current = col;
    },
    [entryColumnById],
  );

  const onDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const activeId = String(event.active.id ?? '');
      const overId = event.over ? String(event.over.id ?? '') : '';
      if (!activeId || !overId) return;

      const sourceColumnKey = entryColumnById.get(activeId);
      const destinationColumnKey = overId.startsWith('column:')
        ? overId.replace('column:', '')
        : entryColumnById.get(overId);

      if (!sourceColumnKey || !destinationColumnKey || sourceColumnKey === destinationColumnKey) return;

      setColumnOrder((previous) => {
        const sourceIds = [...(previous[sourceColumnKey] ?? defaultEntryIdsByColumn.get(sourceColumnKey) ?? [])];
        const destinationIds = [
          ...(previous[destinationColumnKey] ?? defaultEntryIdsByColumn.get(destinationColumnKey) ?? []),
        ];
        const fromIndex = sourceIds.indexOf(activeId);
        if (fromIndex < 0) return previous;

        sourceIds.splice(fromIndex, 1);
        const destinationIndex = overId.startsWith('column:') ? destinationIds.length : destinationIds.indexOf(overId);
        const safeDestinationIndex = destinationIndex < 0 ? destinationIds.length : destinationIndex;
        destinationIds.splice(safeDestinationIndex, 0, activeId);

        const next = { ...previous, [sourceColumnKey]: sourceIds, [destinationColumnKey]: destinationIds };
        return areColumnOrdersEqual(previous, next) ? previous : next;
      });

      // Track that we moved the card to the destination column
      dragCurrentColumnKeyRef.current = destinationColumnKey;
    },
    [defaultEntryIdsByColumn, entryColumnById],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const activeId = String(event.active.id ?? '');
      const overId = event.over ? String(event.over.id ?? '') : '';

      if (activeId && overId) {
        // Use the tracked current column (updated by onDragOver on cross-column moves)
        // instead of the original column, so we reorder within the correct column.
        const currentColumnKey = dragCurrentColumnKeyRef.current ?? entryColumnById.get(activeId);
        const overColumnKey = overId.startsWith('column:')
          ? overId.replace('column:', '')
          : entryColumnById.get(overId);

        if (currentColumnKey && overColumnKey) {
          // Determine if the card started and ended in the same column overall.
          const originalColumnKey = dragStartColumnKeyRef.current;
          const isSameColumnDrop = originalColumnKey === (dragCurrentColumnKeyRef.current ?? overColumnKey);

          if (currentColumnKey === overColumnKey) {
            if (disableSameColumnReorder && isSameColumnDrop) {
              // Within-column reorder blocked by sort rules.
              onReorderBlocked?.();
            } else {
              // Within-column reorder (handles both pure same-column drags and
              // repositioning after a cross-column move by onDragOver).
              setColumnOrder((previous) => {
                const ids = [...(previous[currentColumnKey] ?? defaultEntryIdsByColumn.get(currentColumnKey) ?? [])];
                const fromIndex = ids.indexOf(activeId);
                const toIndex = overId.startsWith('column:') ? ids.length - 1 : ids.indexOf(overId);
                if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return previous;
                return { ...previous, [currentColumnKey]: arrayMove(ids, fromIndex, toIndex) };
              });
            }
          } else {
            // Edge case: card dropped on a column different from its tracked current
            // column (e.g. onDragOver didn't fire for this specific cross-column).
            setColumnOrder((previous) => {
              const sourceIds = [
                ...(previous[currentColumnKey] ?? defaultEntryIdsByColumn.get(currentColumnKey) ?? []),
              ];
              const destIds = [...(previous[overColumnKey] ?? defaultEntryIdsByColumn.get(overColumnKey) ?? [])];
              const fromIndex = sourceIds.indexOf(activeId);
              if (fromIndex < 0) return previous;
              sourceIds.splice(fromIndex, 1);
              const targetIndex = overId.startsWith('column:') ? destIds.length : destIds.indexOf(overId);
              const safeTarget = targetIndex < 0 ? destIds.length : targetIndex;
              destIds.splice(safeTarget, 0, activeId);
              return {
                ...previous,
                [currentColumnKey]: sourceIds,
                [overColumnKey]: destIds,
              };
            });
            dragCurrentColumnKeyRef.current = overColumnKey;
          }

          // Determine if the card moved to a different column overall.
          const finalColumnKey = dragCurrentColumnKeyRef.current ?? overColumnKey;
          if (originalColumnKey && finalColumnKey && originalColumnKey !== finalColumnKey && onCrossColumnMove) {
            const movedEntry = entryById.get(activeId);
            const destinationColumn = columns.find((col) => col.key === finalColumnKey);
            if (movedEntry && destinationColumn) {
              onCrossColumnMove(activeId, movedEntry, originalColumnKey, finalColumnKey, destinationColumn);
            }
          }

          // Compute and persist the new position based on neighbors in the final column.
          // Skip when the within-column reorder was blocked.
          if (onPositionChange && !(disableSameColumnReorder && isSameColumnDrop)) {
            // Read the updated column order synchronously after the setColumnOrder calls above.
            // Since React batches state updates, we compute position from the columnOrder
            // state updater's result by reading it via a callback.
            setColumnOrder((current) => {
              const destKey = dragCurrentColumnKeyRef.current ?? overColumnKey;
              const ids = destKey ? (current[destKey] ?? []) : [];
              const myIndex = ids.indexOf(activeId);
              if (myIndex >= 0) {
                const aboveId = myIndex > 0 ? ids[myIndex - 1] : undefined;
                const belowId = myIndex < ids.length - 1 ? ids[myIndex + 1] : undefined;
                const aboveEntry = aboveId ? entryById.get(aboveId) : undefined;
                const belowEntry = belowId ? entryById.get(belowId) : undefined;
                const abovePos = typeof aboveEntry?.position === 'number' ? aboveEntry.position : 0;
                const belowPos = typeof belowEntry?.position === 'number' ? belowEntry.position : 0;
                let newPos: number;
                if (!aboveEntry && !belowEntry) newPos = 0;
                else if (!aboveEntry) newPos = belowPos + 1;
                else if (!belowEntry) newPos = abovePos - 1;
                else newPos = (abovePos + belowPos) / 2;

                const movedEntry = entryById.get(activeId);
                if (movedEntry) {
                  onPositionChange(activeId, movedEntry, newPos);
                }
              }
              return current; // no mutation, just reading
            });
          }
        }
      }

      setActiveDragId(null);
      // For cross-column moves, delay resetting isDraggingRef so the sync effect
      // doesn't revert the optimistic column order before the async move persists.
      const wasCrossColumn = dragStartColumnKeyRef.current !== dragCurrentColumnKeyRef.current;
      dragStartColumnKeyRef.current = null;
      dragCurrentColumnKeyRef.current = null;
      if (wasCrossColumn) {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 500);
      } else {
        isDraggingRef.current = false;
      }
    },
    [
      columns,
      defaultEntryIdsByColumn,
      disableSameColumnReorder,
      entryById,
      entryColumnById,
      onCrossColumnMove,
      onPositionChange,
      onReorderBlocked,
    ],
  );

  const onDragCancel = React.useCallback(() => {
    setActiveDragId(null);
    isDraggingRef.current = false;
    dragStartColumnKeyRef.current = null;
    dragCurrentColumnKeyRef.current = null;
  }, []);

  return {
    activeDragId,
    entryById,
    orderedColumns,
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  };
}
