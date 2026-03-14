import { MtCollectionLayoutComponent, MtCollectionLayoutSettingsProps } from '../MtCollection';
import { DndContext, DragOverlay, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBoardDnd } from './useBoardDnd';
import { useMtToast } from '../../../MtToast';
import { AlignLeft, ArrowUpDown, ChevronRight, Columns3, CornerLeftUp, Layers3, ListFilter, MessageSquare, Pencil, X } from 'lucide-react';
import { MtDrawerMenuItem, MtDrawerMenuPage, MtDrawerMenuSection } from '../MtCollectionViewSettings';
import { useMtCollection } from '../MtCollectionContext';
import React from 'react';
import MtAvatar from '../../../MtAvatar';
import {
  applyCollectionQuickFilters,
  applyCollectionSort,
  applyCollectionFilters,
  getCollectionEntryAssignee,
  getCollectionEntryId,
  getCollectionEntryPriority,
  getCollectionEntrySummary,
  getCollectionFilterRuleCount,
  getDefaultCollectionFilter,
  getUniqueEntryValues,
  isCollectionFilterActive,
  COLLECTION_SORT_FIELDS,
  COLLECTION_FILTER_OPERATORS,
  buildCollectionFilterFields,
} from '../MtCollectionEntryUtils';
import type { MtCollectionFilterState, MtCollectionQuickFilterState } from '../MtCollectionEntryUtils';
import {
  MtCollectionAssigneeDropdown,
  type MtCollectionAssigneeOption,
  MtIssueTypeSelect,
  MtPrioirtySelect,
  MtStateSelect,
} from '../MtCollectionEntryControls';
import { MtFilterDropdown } from '../../../MtFilter';
import { MtSortDropdown, MtSortRule } from '../../../MtSort';
import { MtDropdown, MtDropdownItem } from '../../../MtDropdown';
import { MtButton } from '../../../MtButton';
import type { MtCollectionDiscreteValueOption } from '../MtCollection';

const REQUIRED_VISIBLE_PROPERTY_IDS = ['summary'];

function ensureRequiredVisibleProperties(propertyIds: string[]) {
  return Array.from(new Set([...propertyIds, ...REQUIRED_VISIBLE_PROPERTY_IDS]));
}

function buildBoardPropertyOptions(properties: Array<{ id: string; label: string; groupable?: boolean }>) {
  const options = [...properties];
  const hasId = (id: string) => options.some((property) => property.id === id);

  if (!hasId('summary')) {
    options.unshift({ id: 'summary', label: 'Summary' });
  }
  if (!hasId('type') && !hasId('entryType') && !hasId('issueType')) {
    options.push({ id: 'type', label: 'Type' });
  }

  return options;
}

function getDiscreteValueStrings(values: Array<string | MtCollectionDiscreteValueOption> | undefined) {
  return (values ?? []).map((value) => (typeof value === 'string' ? value : value.value));
}

export function MtCollectionBoardCard({
  entry,
  onSummaryChange,
  onPriorityChange,
  onStatusChange,
  onIssueTypeChange,
  onAssigneeChange,
  onClick,
  isDragPreview,
  visiblePropertySet,
  parentDisplayId,
  statusOptions,
  priorityOptions,
  issueTypeOptions,
  assigneeOptions,
}: {
  entry: any;
  onSummaryChange?: (nextSummary: string) => void;
  onPriorityChange?: (nextPriority: string) => void;
  onStatusChange?: (nextStatus: string) => void;
  onIssueTypeChange?: (nextType: string) => void;
  onAssigneeChange?: (nextAssignee?: string) => void;
  onClick?: () => void;
  isDragPreview?: boolean;
  visiblePropertySet: Set<string>;
  parentDisplayId?: string;
  statusOptions?: string[];
  priorityOptions?: string[];
  issueTypeOptions?: Array<string | MtCollectionDiscreteValueOption>;
  assigneeOptions?: MtCollectionAssigneeOption[];
}) {
  const displayId = getCollectionEntryId(entry);
  const priority = getCollectionEntryPriority(entry);
  const status = entry?.status ? String(entry.status) : entry?.state ? String(entry.state) : '';
  const assignee = getCollectionEntryAssignee(entry);
  const summary = getCollectionEntrySummary(entry);
  const entryType = String(entry?.entryType ?? entry?.issueType ?? entry?.type ?? '').toLowerCase();
  const commentCount = typeof entry?.commentCount === 'number' ? entry.commentCount : 0;
  const hasDescription = !!(entry?.descriptionPageId || entry?.description);
  const showSummary = visiblePropertySet.has('summary');
  const showId = visiblePropertySet.has('id');
  const showStatus = visiblePropertySet.has('status') || visiblePropertySet.has('state');
  const showIssueType =
    visiblePropertySet.has('type') || visiblePropertySet.has('entryType') || visiblePropertySet.has('issueType');
  const showPriority = visiblePropertySet.has('priority');
  const showAssignee = visiblePropertySet.has('assignee');
  const showMetaRow = showId || showIssueType || showStatus || showPriority || showAssignee;

  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(summary);
  const renameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setRenameValue(summary);
  }, [summary]);

  React.useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  const commitRename = React.useCallback(() => {
    setIsRenaming(false);
    if (renameValue !== summary) onSummaryChange?.(renameValue);
  }, [renameValue, summary, onSummaryChange]);

  return (
    <div
      className="rounded border border-[#2A2A2A] bg-[#141414] p-3 text-sm cursor-pointer hover:border-[#3A3A3A] transition-colors"
      onClick={onClick}
    >
      {parentDisplayId ? (
        <div className="flex items-center gap-1 text-text-muted text-xs mb-1.5">
          <CornerLeftUp size={11} />
          <span>{parentDisplayId}</span>
        </div>
      ) : null}
      {showSummary ? (
        isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenameValue(summary); setIsRenaming(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-[#2A2A2A] bg-transparent px-1 py-0.5 text-sm text-text-primary outline-none focus:border-border-focus"
          />
        ) : (
          <div className="group/summary flex items-center gap-1 px-1 py-0.5 min-w-0">
            <span className="text-sm text-text-primary truncate">{summary || 'Untitled'}</span>
            <button
              type="button"
              className="shrink-0 text-text-muted hover:text-text-primary opacity-0 group-hover/summary:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
              aria-label="Rename"
            >
              <Pencil size={11} />
            </button>
          </div>
        )
      ) : null}

      {showMetaRow ? (
        <div className="flex row justify-between items-center px-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex row gap-2 items-center min-w-0">
            {showIssueType ? (
              isDragPreview ? (
                <div className="text-xs text-text-muted truncate">{entryType || '—'}</div>
              ) : (
                <MtIssueTypeSelect
                  value={entryType}
                  options={issueTypeOptions}
                  onChange={onIssueTypeChange ?? (() => undefined)}
                />
              )
            ) : null}
            {showId ? (
              <span className="text-xs text-text-muted">{displayId}</span>
            ) : null}
            {showStatus ? (
              isDragPreview ? (
                <div className="text-xs text-text-muted truncate">{status || '—'}</div>
              ) : (
                <MtStateSelect value={status} options={statusOptions} onChange={onStatusChange ?? (() => undefined)} />
              )
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-primary">
            {hasDescription ? (
              <span className="flex items-center text-text-muted" title="Has description">
                <AlignLeft size={11} />
              </span>
            ) : null}
            {commentCount > 0 ? (
              <span className="flex items-center gap-0.5 text-text-muted" title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}>
                <MessageSquare size={11} />
                <span className="text-[10px]">{commentCount}</span>
              </span>
            ) : null}
            {showPriority ? (
              isDragPreview ? (
                <div className="text-xs text-text-muted truncate">{priority || '—'}</div>
              ) : (
                <MtPrioirtySelect
                  value={priority}
                  options={priorityOptions}
                  onChange={onPriorityChange ?? (() => undefined)}
                />
              )
            ) : null}
            {showAssignee ? (
              !isDragPreview && assigneeOptions && assigneeOptions.length > 0 ? (
                <MtCollectionAssigneeDropdown
                  assignee={typeof assignee === 'string' ? assignee : undefined}
                  options={assigneeOptions}
                  onChange={onAssigneeChange ?? (() => undefined)}
                />
              ) : (
                <MtAvatar name={String(assignee ?? '')} size="xs" />
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function groupEntries(entries: any[], groupBy?: string | null, properties?: Array<any>) {
  if (!groupBy) {
    return [{ key: 'all', label: 'All', entries }];
  }

  const grouped = new Map<string, any[]>();

  entries.forEach((entry) => {
    const rawValue = entry?.[groupBy as keyof typeof entry];
    const groupKey = rawValue === null || rawValue === undefined || rawValue === '' ? 'Ungrouped' : String(rawValue);

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, []);
    }

    grouped.get(groupKey)!.push(entry);
  });

  // Find property metadata for discrete values
  const groupProperty = properties?.find((p) => p.id === groupBy);
  const discreteValues = getDiscreteValueStrings(groupProperty?.discreteValues);

  // If property has discrete values, ensure all are represented as columns
  if (discreteValues.length > 0) {
    const result = discreteValues.map((value) => ({
      key: `${groupBy}-${value}`,
      label: value,
      entries: grouped.get(value) ?? [],
    }));
    // Add ungrouped if it has entries
    if (grouped.has('Ungrouped')) {
      result.push({
        key: `${groupBy}-Ungrouped`,
        label: 'Ungrouped',
        entries: grouped.get('Ungrouped')!,
      });
    }
    return result;
  }

  return Array.from(grouped.entries()).map(([label, groupedEntries]) => ({
    key: `${groupBy}-${label}`,
    label,
    entries: groupedEntries,
  }));
}

type BoardColumn = {
  key: string;
  label: string;
  entries: any[];
};

export function SortableBoardCard({
  id,
  children,
  onClick,
}: {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition ?? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40 z-10' : ''}`}
    >
      {children}
    </div>
  );
}

export function DroppableColumn({
  columnKey,
  label,
  trailing,
  entryIds,
  children,
}: {
  columnKey: string;
  label: string;
  trailing?: React.ReactNode;
  entryIds: string[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${columnKey}` });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 min-w-72 flex flex-col rounded border bg-[#111111] transition-[border-color] duration-200 ease-out ${isOver ? 'border-border-default' : 'border-[#2A2A2A]'}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border-default px-3 py-2 text-sm">
        <span className="text-text-primary">{label}</span>
        <span className="text-text-muted">{trailing ?? entryIds.length}</span>
      </div>

      <SortableContext items={entryIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">{children}</div>
      </SortableContext>
    </div>
  );
}

/** @deprecated Use DroppableColumn instead */
export const BoardDroppableColumn = DroppableColumn;

export const MtCollectionBoardLayout: MtCollectionLayoutComponent = (props) => {
  const EntryComponent = props.renderEntry;
  const { onEntryClick } = useMtCollection();
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
  const [entryPatches, setEntryPatches] = React.useState<Record<string, Record<string, unknown>>>({});

  // Map from Convex _id -> entry for parent lookup
  const entryByConvexId = React.useMemo(
    () => new Map(props.entries.map((e: any) => [String(e._id ?? ''), e])),
    [props.entries],
  );

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

  const effectiveGroupBy = props.groupBy ?? 'status';
  const sortBy = typeof props.viewSettings?.sortBy === 'string' ? props.viewSettings.sortBy : 'updated';
  const quickFilters = React.useMemo(
    () => (props.viewSettings?.quickFilters as MtCollectionQuickFilterState | undefined) ?? {},
    [props.viewSettings?.quickFilters],
  );
  const sortRules = React.useMemo(
    () => (props.viewSettings?.sortRules as MtSortRule[] | undefined) ?? [],
    [props.viewSettings?.sortRules],
  );
  const filterState = React.useMemo(
    () => (props.viewSettings?.filter ?? {}) as MtCollectionFilterState,
    [props.viewSettings?.filter],
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
  const columns = React.useMemo(
    () => groupEntries(sortedEntries, effectiveGroupBy, properties) as BoardColumn[],
    [effectiveGroupBy, properties, sortedEntries],
  );
  const entriesByColumn = React.useMemo(() => {
    const map = new Map<string, any[]>();
    columns.forEach((col) => map.set(col.key, col.entries));
    return map;
  }, [columns]);

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
    (_activeId: string, movedEntry: any, _sourceColumnKey: string, _destColumnKey: string, destColumn: BoardColumn) => {
      if (effectiveGroupBy) {
        applyEntryPatch(movedEntry, {
          [effectiveGroupBy]: destColumn.label === 'Ungrouped' ? null : destColumn.label,
        });
      }
    },
    [effectiveGroupBy, applyEntryPatch],
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
    useBoardDnd({
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
            {orderedColumns.map(({ column, entryIds }) => (
              <DroppableColumn key={column.key} columnKey={column.key} label={column.label} entryIds={entryIds}>
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
                      {EntryComponent ? (
                        <EntryComponent entry={entry} />
                      ) : (
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
                      )}
                    </SortableBoardCard>
                  );
                })}
              </DroppableColumn>
            ))}
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

function MtCollectionBoardLayoutSettingsMenu({
  currentView,
  properties,
  viewSettings,
  setViewSettings,
  setCurrentView,
}: MtCollectionLayoutSettingsProps<any>) {
  const groupableProperties = properties.filter((property) => property.groupable);
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);
  const propertyOptions = buildBoardPropertyOptions(properties);
  const visiblePropertyIds = ensureRequiredVisibleProperties(
    viewSettings.visiblePropertyIds ?? propertyOptions.map((property) => property.id),
  );
  const visiblePropertySet = new Set(visiblePropertyIds);
  const selectedGroup = currentView.groupBy ?? 'status';
  const selectedGroupLabel = selectedGroup
    ? (properties.find((property) => property.id === selectedGroup)?.label ?? selectedGroup)
    : 'None';
  const filterState = (viewSettings.filter ?? {}) as MtCollectionFilterState;
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
          icon={<Columns3 size={14} />}
          label="Properties"
          submenu="properties"
          trailing={
            <>
              {visiblePropertyIds.length}
              <ChevronRight size={14} />
            </>
          }
        />
        <MtDrawerMenuItem
          icon={<Layers3 size={14} />}
          label="Group"
          submenu="group"
          trailing={
            <>
              {selectedGroupLabel}
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

      <MtDrawerMenuPage id="properties" title="Properties">
        <MtDrawerMenuSection title="Visible columns">
          {propertyOptions.map((property) => (
            <MtDrawerMenuItem
              key={property.id}
              label={property.label}
              active={visiblePropertySet.has(property.id)}
              disabled={property.id === 'summary'}
              trailing={<>{visiblePropertySet.has(property.id) ? 'Visible' : 'Hidden'}</>}
              onClick={() => {
                if (property.id === 'summary') {
                  return;
                }

                const isVisible = visiblePropertySet.has(property.id);
                const nextVisiblePropertyIds = isVisible
                  ? visiblePropertyIds.filter((id) => id !== property.id)
                  : [...visiblePropertyIds, property.id];

                setViewSettings({ visiblePropertyIds: ensureRequiredVisibleProperties(nextVisiblePropertyIds) });

                if (isVisible && currentView.groupBy === property.id) {
                  setCurrentView({
                    ...currentView,
                    groupBy: null,
                  });
                }
              }}
            />
          ))}
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>

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

      <MtDrawerMenuPage id="group" title="Group">
        <MtDrawerMenuSection title="Group by">
          {groupableProperties.length > 0 ? (
            groupableProperties.map((property) => (
              <MtDrawerMenuItem
                key={property.id}
                label={property.label}
                active={currentView.groupBy === property.id}
                onClick={() => {
                  setCurrentView({
                    ...currentView,
                    groupBy: property.id,
                  });
                }}
              />
            ))
          ) : (
            <MtDrawerMenuItem label="No groupable properties" disabled />
          )}
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

MtCollectionBoardLayout.SettingsMenu = MtCollectionBoardLayoutSettingsMenu;

function MtCollectionBoardLayoutToolbarActions() {
  const context = useMtCollection();
  const currentView = context.currentView;
  const properties = context.properties;
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);

  if (!currentView) {
    return null;
  }

  const viewSettings = currentView.settings ?? {};
  const sortRules = (viewSettings.sortRules as MtSortRule[] | undefined) ?? [];
  const groupableProperties = properties.filter((property) => property.groupable);
  const currentFilter =
    viewSettings.filter &&
    typeof viewSettings.filter === 'object' &&
    'type' in (viewSettings.filter as Record<string, unknown>)
      ? (viewSettings.filter as any)
      : getDefaultCollectionFilter();
  const hasGroup = !!currentView.groupBy;
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
        <MtDropdown
          title={<Layers3 size={16} stroke="#8D8D8D" />}
          kind="icon"
          variant={hasGroup ? 'accent' : 'ghost'}
          showCaret={false}
        >
          <div className="w-56 p-1">
            <MtDropdownItem onSelect={() => setCurrentView({ ...currentView, groupBy: null })}>None</MtDropdownItem>
            {groupableProperties.map((property) => (
              <MtDropdownItem
                key={property.id}
                onSelect={() => setCurrentView({ ...currentView, groupBy: property.id })}
              >
                {property.label}
              </MtDropdownItem>
            ))}
          </div>
        </MtDropdown>
        {hasGroup ? (
          <MtButton kind="icon" variant="ghost" onClick={() => setCurrentView({ ...currentView, groupBy: null })}>
            <X size={14} stroke="#8D8D8D" />
          </MtButton>
        ) : null}
      </div>

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

MtCollectionBoardLayout.ToolbarActions = MtCollectionBoardLayoutToolbarActions;
