import React from 'react';
import { MtCollectionLayoutComponent, MtCollectionLayoutSettingsProps } from '../MtCollection';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { ArrowUpDown, ChevronRight, ListFilter, X } from 'lucide-react';
import {
  applyCollectionFilters,
  applyCollectionQuickFilters,
  applyCollectionSort,
  getCollectionFilterRuleCount,
  getDefaultCollectionFilter,
  getUniqueEntryValues,
  isCollectionFilterActive,
  COLLECTION_SORT_FIELDS,
  COLLECTION_FILTER_OPERATORS,
  buildCollectionFilterFields,
  type MtCollectionFilterState,
  type MtCollectionQuickFilterState,
} from '../MtCollectionEntryUtils';
import type { MtSortRule } from '../../../MtSort';
import { MtCollectionBoardCard, SortableBoardCard, DroppableColumn } from './MtCollectionBoardLayout';
import { useBoardDnd } from './useBoardDnd';
import { useMtToast } from '../../../MtToast';
import type { MtCollectionAssigneeOption } from '../MtCollectionEntryControls';
import { MtDrawerMenuItem, MtDrawerMenuPage, MtDrawerMenuSection } from '../MtCollectionViewSettings';
import { MtFilterDropdown } from '../../../MtFilter';
import { MtSortDropdown } from '../../../MtSort';
import { useMtCollection } from '../MtCollectionContext';
import { MtButton } from '../../../MtButton';

const REQUIRED_VISIBLE_PROPERTY_IDS = ['summary'];

function ensureRequiredVisibleProperties(propertyIds: string[]) {
  return Array.from(new Set([...propertyIds, ...REQUIRED_VISIBLE_PROPERTY_IDS]));
}

function getDiscreteValueStrings(values: Array<string | { value: string }> | undefined) {
  return (values ?? []).map((value) => (typeof value === 'string' ? value : value.value));
}

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
  const { onEntryClick } = useMtCollection();
  const [entryPatches, setEntryPatches] = React.useState<Record<string, Record<string, unknown>>>({});
  const properties = React.useMemo(
    () => (props.properties && props.properties.length > 0 ? props.properties : [{ id: 'id', label: 'ID' }]),
    [props.properties],
  );
  const statusOptions = React.useMemo(
    () =>
      getDiscreteValueStrings(
        properties.find((property) => property.id === 'status' || property.id === 'state')?.discreteValues,
      ),
    [properties],
  );
  const priorityOptions = React.useMemo(
    () => getDiscreteValueStrings(properties.find((property) => property.id === 'priority')?.discreteValues),
    [properties],
  );
  const issueTypeOptions = React.useMemo(
    () => properties.find((property) => ['type', 'entryType', 'issueType'].includes(property.id))?.discreteValues,
    [properties],
  );
  const visiblePropertyIds = React.useMemo(
    () =>
      ensureRequiredVisibleProperties(
        props.viewSettings?.visiblePropertyIds ?? properties.map((property) => property.id),
      ),
    [props.viewSettings?.visiblePropertyIds, properties],
  );
  const visiblePropertySet = React.useMemo(() => new Set(visiblePropertyIds), [visiblePropertyIds]);
  const entryState = React.useMemo(
    () =>
      props.entries.map((entry) => {
        const entryId = String(entry?.id ?? '');
        const patch = entryPatches[entryId];
        return patch ? { ...entry, ...patch } : entry;
      }),
    [props.entries, entryPatches],
  );
  const assigneeOptions = React.useMemo<MtCollectionAssigneeOption[]>(() => {
    if (props.assigneeOptions && props.assigneeOptions.length > 0) {
      return props.assigneeOptions;
    }

    return getUniqueEntryValues(entryState, 'assignee').map((value) => ({
      value,
      label: value,
    }));
  }, [entryState, props.assigneeOptions]);
  const entryByConvexId = React.useMemo(
    () => new Map(entryState.map((entry: any) => [String(entry._id ?? ''), entry])),
    [entryState],
  );
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

    return [{ key: 'week-unscheduled', label: 'Not planned / overdue' }, ...weekColumns];
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

  const applyEntryPatch = React.useCallback(
    (entry: any, patch: Record<string, unknown>) => {
      const entryId = String(entry?.id ?? '');
      setEntryPatches((previousPatches) => ({
        ...previousPatches,
        [entryId]: {
          ...(previousPatches[entryId] ?? {}),
          ...patch,
        },
      }));
      if (props.onUpdateEntry) {
        void props.onUpdateEntry(entry, patch as any);
      }
    },
    [props.onUpdateEntry],
  );

  const handleCrossColumnMove = React.useCallback(
    (_activeId: string, movedEntry: any, _sourceColumnKey: string, _destColumnKey: string, destColumn: PlanColumn) => {
      const patch =
        destColumn.weekStartMs !== undefined && destColumn.weekEndMs !== undefined
          ? { startDate: destColumn.weekStartMs, dueDate: destColumn.weekEndMs }
          : { startDate: undefined, dueDate: undefined };
      applyEntryPatch(movedEntry, patch);
    },
    [applyEntryPatch],
  );

  const handlePositionChange = React.useCallback(
    (_activeId: string, entry: any, newPosition: number) => {
      applyEntryPatch(entry, { position: newPosition });
    },
    [applyEntryPatch],
  );

  const hasSortRules = sortRules.length > 0;
  const toastCtx = useMtToast();

  const { activeDragId, entryById, orderedColumns, sensors, onDragStart, onDragOver, onDragEnd, onDragCancel } =
    useBoardDnd<PlanColumn>({
      columns,
      entriesByColumn,
      onCrossColumnMove: handleCrossColumnMove,
      onPositionChange: handlePositionChange,
      disableSameColumnReorder: hasSortRules,
      onReorderBlocked: () => {
        toastCtx?.toast('Manual sorting is not available when a sort rule is applied');
      },
    });

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
        autoScroll
      >
        <div className="h-full min-h-0 overflow-x-auto p-3">
          <div className="flex h-full min-w-max gap-3">
            {orderedColumns.map(({ column, entryIds }) => {
              const totalEstimate = entryIds.reduce((sum, id) => sum + getEntryTimeEstimate(entryById.get(id)), 0);

              return (
                <DroppableColumn
                  key={column.key}
                  columnKey={column.key}
                  label={column.label}
                  trailing={totalEstimate}
                  entryIds={entryIds}
                >
                  {entryIds.map((entryId) => {
                    const entry = entryById.get(entryId);
                    if (!entry) {
                      return null;
                    }

                    return (
                      <SortableBoardCard
                        key={entryId}
                        id={entryId}
                        onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
                      >
                        <MtCollectionBoardCard
                          entry={entry}
                          isDragPreview={false}
                          visiblePropertySet={visiblePropertySet}
                          statusOptions={statusOptions}
                          priorityOptions={priorityOptions}
                          issueTypeOptions={issueTypeOptions}
                          assigneeOptions={assigneeOptions}
                          parentDisplayId={
                            entry?.parentId
                              ? String(
                                  entryByConvexId.get(String(entry.parentId))?.id ??
                                    entryByConvexId.get(String(entry.parentId))?._id ??
                                    entry.parentId,
                                )
                              : undefined
                          }
                          onSummaryChange={(nextSummary) => {
                            applyEntryPatch(entry, { summary: nextSummary });
                          }}
                          onPriorityChange={(nextPriority) => {
                            applyEntryPatch(entry, { priority: nextPriority });
                          }}
                          onStatusChange={(nextStatus) => {
                            applyEntryPatch(entry, { status: nextStatus, state: nextStatus });
                          }}
                          onIssueTypeChange={(nextType) => {
                            applyEntryPatch(entry, {
                              entryType: nextType,
                              type: nextType,
                              issueType: nextType,
                            });
                          }}
                          onAssigneeChange={(nextAssignee) => {
                            applyEntryPatch(entry, { assignee: nextAssignee });
                          }}
                        />
                      </SortableBoardCard>
                    );
                  })}
                </DroppableColumn>
              );
            })}
          </div>
        </div>
        <DragOverlay>
          {activeDragId ? (
            <div className="w-72 opacity-95 pointer-events-none shadow-lg">
              {(() => {
                const activeEntry = entryById.get(activeDragId);
                if (!activeEntry) {
                  return null;
                }

                return (
                  <MtCollectionBoardCard
                    entry={activeEntry}
                    isDragPreview={false}
                    visiblePropertySet={visiblePropertySet}
                    statusOptions={statusOptions}
                    priorityOptions={priorityOptions}
                    issueTypeOptions={issueTypeOptions}
                    assigneeOptions={assigneeOptions}
                    parentDisplayId={
                      activeEntry?.parentId
                        ? String(
                            entryByConvexId.get(String(activeEntry.parentId))?.id ??
                              entryByConvexId.get(String(activeEntry.parentId))?._id ??
                              activeEntry.parentId,
                          )
                        : undefined
                    }
                  />
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

function MtCollectionPlanLayoutSettingsMenu({
  currentView,
  properties,
  viewSettings,
  setViewSettings,
  setCurrentView,
}: MtCollectionLayoutSettingsProps<any>) {
  const filterState = (viewSettings.filter ?? {}) as MtCollectionFilterState;
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);
  const activeFilterCount = getCollectionFilterRuleCount(filterState);
  const sortRules = (viewSettings.sortRules as MtSortRule[] | undefined) ?? [];

  const selectedSortLabel =
    sortRules.length > 0
      ? (COLLECTION_SORT_FIELDS.find((field) => field.value === sortRules[0].property)?.label ?? sortRules[0].property)
      : 'None';

  const currentFilterValue =
    'type' in filterState && filterState.type === 'group' ? filterState : getDefaultCollectionFilter();

  return (
    <>
      <MtDrawerMenuSection title="View options">
        <MtDrawerMenuItem
          icon={<ListFilter size={14} />}
          label="Filter"
          submenu="filter"
          trailing={
            <>
              {activeFilterCount > 0 ? `${activeFilterCount} active` : 'None'}
              <ChevronRight size={14} />
            </>
          }
        />
        <MtDrawerMenuItem
          icon={<ArrowUpDown size={14} />}
          label="Sort"
          submenu="sort"
          trailing={
            <>
              {selectedSortLabel}
              <ChevronRight size={14} />
            </>
          }
        />
      </MtDrawerMenuSection>

      <MtDrawerMenuPage id="filter" title="Filter">
        <MtDrawerMenuSection>
          <div className="px-2">
            <MtFilterDropdown
              title="Filter"
              value={currentFilterValue}
              onChange={(nextFilter) => {
                setCurrentView({
                  ...currentView,
                  settings: {
                    ...(currentView.settings ?? {}),
                    filter: nextFilter,
                  },
                });
              }}
              fields={filterFields}
              operators={COLLECTION_FILTER_OPERATORS}
              variant="ghost"
            />
          </div>
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>

      <MtDrawerMenuPage id="sort" title="Sort">
        <MtDrawerMenuSection>
          <div className="px-2">
            <MtSortDropdown
              title="Sort"
              value={sortRules}
              onChange={(nextSortRules) => {
                setViewSettings({ sortRules: nextSortRules });
              }}
              fields={COLLECTION_SORT_FIELDS}
              variant="ghost"
            />
          </div>
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>
    </>
  );
}

MtCollectionPlanLayout.SettingsMenu = MtCollectionPlanLayoutSettingsMenu;

function MtCollectionPlanLayoutToolbarActions() {
  const context = useMtCollection();
  const currentView = context.currentView;
  const properties = context.properties;
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);

  if (!currentView) {
    return null;
  }

  const viewSettings = currentView.settings ?? {};
  const sortRules = (viewSettings.sortRules as MtSortRule[] | undefined) ?? [];
  const currentFilter =
    viewSettings.filter &&
    typeof viewSettings.filter === 'object' &&
    'type' in (viewSettings.filter as Record<string, unknown>)
      ? (viewSettings.filter as any)
      : getDefaultCollectionFilter();
  const hasSort = sortRules.length > 0;
  const hasFilter = isCollectionFilterActive(viewSettings.filter as MtCollectionFilterState | undefined);

  const setCurrentView = context.setCurrentView;
  const setViewSettings = (settings: Partial<Record<string, unknown>>) => {
    setCurrentView({
      ...currentView,
      settings: {
        ...(currentView.settings ?? {}),
        ...settings,
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <MtSortDropdown
          title="Sort"
          kind="icon"
          variant={hasSort ? 'accent' : 'ghost'}
          showCaret={false}
          value={sortRules}
          onChange={(nextSortRules) => setViewSettings({ sortRules: nextSortRules })}
          fields={COLLECTION_SORT_FIELDS}
        />
        {hasSort ? (
          <MtButton kind="icon" variant="ghost" onClick={() => setViewSettings({ sortRules: [] })}>
            <X size={14} stroke="#8D8D8D" />
          </MtButton>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <MtFilterDropdown
          title="Filter"
          kind="icon"
          variant={hasFilter ? 'accent' : 'ghost'}
          showCaret={false}
          value={currentFilter}
          onChange={(nextFilter) => setViewSettings({ filter: nextFilter })}
          fields={filterFields}
          operators={COLLECTION_FILTER_OPERATORS}
        />
        {hasFilter ? (
          <MtButton kind="icon" variant="ghost" onClick={() => setViewSettings({ filter: undefined })}>
            <X size={14} stroke="#8D8D8D" />
          </MtButton>
        ) : null}
      </div>
    </>
  );
}

MtCollectionPlanLayout.ToolbarActions = MtCollectionPlanLayoutToolbarActions;
