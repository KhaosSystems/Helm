import React from 'react';
import { MtCollectionLayoutComponent } from '../MtCollection';
import {
  applyCollectionFilters,
  applyCollectionQuickFilters,
  applyCollectionSort,
  type MtCollectionFilterState,
  type MtCollectionQuickFilterState,
} from '../MtCollectionEntryUtils';
import type { MtSortRule } from '../../../MtSort';

type PlanColumn = {
  key: string;
  label: string;
  weekStartMs?: number;
  weekEndMs?: number;
};

function startOfIsoWeek(input: Date) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(input: Date, days: number) {
  const date = new Date(input);
  date.setDate(date.getDate() + days);
  return date;
}

function endOfDay(input: Date) {
  const date = new Date(input);
  date.setHours(23, 59, 59, 999);
  return date;
}

function getIsoWeekNumber(input: Date) {
  const date = new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  const dayNumber = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getEntryStartDateMs(entry: any) {
  const value = entry?.startDate;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

function getEntryTimeEstimate(entry: any) {
  const value = Number(entry?.timeEstimate ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export const MtCollectionPlanLayout: MtCollectionLayoutComponent = (props) => {
  const [entryState, setEntryState] = React.useState(props.entries);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const sortBy = typeof props.viewSettings?.sortBy === 'string' ? props.viewSettings.sortBy : 'updated';
  const sortRules = React.useMemo(
    () => (props.viewSettings?.sortRules as MtSortRule[] | undefined) ?? [],
    [props.viewSettings?.sortRules],
  );
  const filterState = React.useMemo(
    () => (props.viewSettings?.filter ?? {}) as MtCollectionFilterState,
    [props.viewSettings?.filter],
  );
  const quickFilters = React.useMemo(
    () => (props.viewSettings?.quickFilters as MtCollectionQuickFilterState | undefined) ?? {},
    [props.viewSettings?.quickFilters],
  );

  React.useEffect(() => {
    setEntryState(props.entries);
  }, [props.entries]);

  const filteredEntries = React.useMemo(
    () => applyCollectionFilters(entryState, filterState),
    [entryState, filterState],
  );
  const toolbarFilteredEntries = React.useMemo(
    () => applyCollectionQuickFilters(filteredEntries, quickFilters),
    [filteredEntries, quickFilters],
  );
  const sortedEntries = React.useMemo(
    () => applyCollectionSort(toolbarFilteredEntries, sortRules, sortBy),
    [toolbarFilteredEntries, sortRules, sortBy],
  );

  const columns = React.useMemo<PlanColumn[]>(() => {
    const baseWeekStart = startOfIsoWeek(new Date());
    const weekColumns: PlanColumn[] = Array.from({ length: 7 }, (_, offset) => {
      const weekStart = addDays(baseWeekStart, offset * 7);
      const weekEnd = endOfDay(addDays(weekStart, 6));
      const weekNumber = getIsoWeekNumber(weekStart);
      return {
        key: `week-${offset}`,
        label: `Week ${weekNumber}`,
        weekStartMs: weekStart.getTime(),
        weekEndMs: weekEnd.getTime(),
      };
    });

    return [{ key: 'week-unscheduled', label: 'No start date' }, ...weekColumns];
  }, []);

  const entriesByColumn = React.useMemo(() => {
    const map = new Map<string, any[]>();
    columns.forEach((column) => map.set(column.key, []));

    sortedEntries.forEach((entry) => {
      const startDateMs = getEntryStartDateMs(entry);
      if (startDateMs === undefined) {
        map.get('week-unscheduled')?.push(entry);
        return;
      }

      const matchingColumn = columns.find(
        (column) =>
          column.weekStartMs !== undefined &&
          column.weekEndMs !== undefined &&
          startDateMs >= column.weekStartMs &&
          startDateMs <= column.weekEndMs,
      );

      if (matchingColumn) {
        map.get(matchingColumn.key)?.push(entry);
      } else {
        map.get('week-unscheduled')?.push(entry);
      }
    });

    return map;
  }, [columns, sortedEntries]);

  const updateEntry = React.useCallback(
    (entryId: string, patch: Record<string, unknown>) => {
      setEntryState((previousEntries) =>
        previousEntries.map((entry) =>
          String(entry?.id) === entryId
            ? {
                ...entry,
                ...patch,
              }
            : entry,
        ),
      );
    },
    [],
  );

  return (
    <div className="h-full min-h-0 overflow-auto p-3">
      <div className="flex min-w-max gap-3">
        {columns.map((column) => {
          const columnEntries = entriesByColumn.get(column.key) ?? [];
          const totalEstimate = columnEntries.reduce((sum, entry) => sum + getEntryTimeEstimate(entry), 0);

          return (
            <div
              key={column.key}
              className="w-72 shrink-0 rounded border border-[#2A2A2A] bg-[#111111]"
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                event.preventDefault();
                const movedId = event.dataTransfer.getData('text/plain') || draggingId;
                if (!movedId) {
                  return;
                }

                const movedEntry = entryState.find((entry) => String(entry?.id) === movedId);
                if (!movedEntry) {
                  setDraggingId(null);
                  return;
                }

                const patch =
                  column.weekStartMs !== undefined && column.weekEndMs !== undefined
                    ? {
                        startDate: column.weekStartMs,
                        dueDate: column.weekEndMs,
                      }
                    : {
                        startDate: undefined,
                        dueDate: undefined,
                      };

                updateEntry(movedId, patch);
                if (props.onUpdateEntry) {
                  void props.onUpdateEntry(movedEntry, patch as any);
                }
                setDraggingId(null);
              }}
            >
              <div className="flex items-center justify-between border-b border-[#2A2A2A] px-3 py-2">
                <div className="text-sm text-text-primary">{column.label}</div>
                <div className="text-xs text-text-muted">{totalEstimate}</div>
              </div>

              <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-2 overflow-auto p-2">
                {columnEntries.map((entry) => {
                  const entryId = String(entry?.id ?? '');
                  const summary = String(entry?.summary ?? 'Untitled');

                  return (
                    <div
                      key={entryId}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', entryId);
                        setDraggingId(entryId);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      className="cursor-grab rounded border border-[#2A2A2A] bg-[#141414] p-2 active:cursor-grabbing"
                    >
                      <div className="text-xs text-text-muted">{entryId}</div>
                      <div className="truncate text-sm text-text-primary">{summary}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
