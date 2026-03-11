import { MtCollectionLayoutComponent, MtCollectionLayoutSettingsProps } from '../MtCollection';
import {
  ArrowUpDown,
  ChevronRight,
  Columns3,
  CornerLeftUp,
  Layers3,
  ListFilter,
  X,
} from 'lucide-react';
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
  isCollectionFilterActive,
} from '../MtCollectionEntryUtils';
import type { MtCollectionFilterState, MtCollectionQuickFilterState } from '../MtCollectionEntryUtils';
import {
  MtCollectionSummaryInput,
  MtIssueTypeSelect,
  MtIssueTypePreview,
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

/** Default card component used when no renderEntry is provided. */
function DefaultBoardEntry({
  entry,
  onSummaryChange,
  onPriorityChange,
  onStatusChange,
  onIssueTypeChange,
  visiblePropertySet,
  parentDisplayId,
  statusOptions,
  priorityOptions,
  issueTypeOptions,
}: {
  entry: any;
  onSummaryChange: (nextSummary: string) => void;
  onPriorityChange: (nextPriority: string) => void;
  onStatusChange: (nextStatus: string) => void;
  onIssueTypeChange: (nextType: string) => void;
  visiblePropertySet: Set<string>;
  parentDisplayId?: string;
  statusOptions?: string[];
  priorityOptions?: string[];
  issueTypeOptions?: Array<string | MtCollectionDiscreteValueOption>;
}) {
  const displayId = getCollectionEntryId(entry);
  const priority = getCollectionEntryPriority(entry);
  const status = entry?.status ? String(entry.status) : entry?.state ? String(entry.state) : '';
  const assignee = getCollectionEntryAssignee(entry);
  const summary = getCollectionEntrySummary(entry);
  const entryType = String(entry?.entryType ?? entry?.issueType ?? entry?.type ?? '').toLowerCase();
  const showSummary = visiblePropertySet.has('summary');
  const showId = visiblePropertySet.has('id');
  const showStatus = visiblePropertySet.has('status') || visiblePropertySet.has('state');
  const showIssueType =
    visiblePropertySet.has('type') || visiblePropertySet.has('entryType') || visiblePropertySet.has('issueType');
  const showPriority = visiblePropertySet.has('priority');
  const showAssignee = visiblePropertySet.has('assignee');
  const showMetaRow = showId || showIssueType || showStatus || showPriority || showAssignee;

  return (
    <div className="rounded border border-[#2A2A2A] bg-[#141414] p-3 text-sm">
      {parentDisplayId ? (
        <div className="flex items-center gap-1 text-text-muted text-xs mb-1.5">
          <CornerLeftUp size={11} />
          <span>{parentDisplayId}</span>
        </div>
      ) : null}
      {showSummary ? <MtCollectionSummaryInput value={summary} onChange={onSummaryChange} /> : null}

      {showMetaRow ? (
        <div className="flex row justify-between items-center px-1">
          <div className="flex row gap-2 items-center min-w-0">
            {showIssueType ? (
              <MtIssueTypeSelect value={entryType} options={issueTypeOptions} onChange={onIssueTypeChange} />
            ) : null}
            {showId ? (
              <>
                {!showIssueType ? <MtIssueTypePreview value={entryType} options={issueTypeOptions} size={14} /> : null}
                <div className="text-xs text-text-primary">{displayId}</div>
              </>
            ) : null}
            {showStatus ? <MtStateSelect value={status} options={statusOptions} onChange={onStatusChange} /> : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-primary">
            {showPriority ? (
              <MtPrioirtySelect value={priority} options={priorityOptions} onChange={onPriorityChange} />
            ) : null}
            {showAssignee ? <MtAvatar name={String(assignee ?? '')} size="xs" /> : null}
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

export const MtCollectionBoardLayout: MtCollectionLayoutComponent = (props) => {
  const EntryComponent = props.renderEntry;
  const properties = React.useMemo(
    () => (props.properties && props.properties.length > 0 ? props.properties : [{ id: 'id', label: 'ID' }]),
    [props.properties],
  );
  const statusOptions = React.useMemo(
    () => getDiscreteValueStrings(properties.find((property) => property.id === 'status' || property.id === 'state')?.discreteValues),
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
  const [entryState, setEntryState] = React.useState(props.entries);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] = React.useState<string | null>(null);

  // Map from Convex _id -> entry for parent lookup
  const entryByConvexId = React.useMemo(
    () => new Map(props.entries.map((e: any) => [String(e._id ?? ''), e])),
    [props.entries],
  );

  React.useEffect(() => {
    setEntryState(props.entries);
  }, [props.entries]);

  const effectiveGroupBy = props.groupBy ?? 'status';
  const sortBy = typeof props.viewSettings?.sortBy === 'string' ? props.viewSettings.sortBy : 'updated';
  const quickFilters = React.useMemo(
    () => (props.viewSettings?.quickFilters as MtCollectionQuickFilterState | undefined) ?? {},
    [props.viewSettings?.quickFilters],
  );
  const sortRules = (props.viewSettings?.sortRules as MtSortRule[] | undefined) ?? [];
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
  const sortedEntries = applyCollectionSort(toolbarFilteredEntries, sortRules, sortBy);
  const columns = groupEntries(sortedEntries, effectiveGroupBy, properties);

  const updateEntry = (entryId: string, patch: Record<string, unknown>) => {
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
  };

  return (
    <div className="h-full min-h-0 overflow-auto p-3">
      <div className="flex min-w-max gap-3">
        {columns.map((column) => (
          <div
            key={column.key}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragOverColumnKey(column.key);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDragLeave={() => {
              if (dragOverColumnKey === column.key) {
                setDragOverColumnKey(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();

              const movedId = event.dataTransfer.getData('text/plain') || draggingId;
              if (!movedId) {
                return;
              }

              setEntryState((previousEntries) => {
                const movedEntry = previousEntries.find((entry) => String(entry?.id) === movedId);
                if (!movedEntry || !effectiveGroupBy) {
                  return previousEntries;
                }

                const nextGroupValue = column.label === 'Ungrouped' ? null : column.label;

                return previousEntries.map((entry) =>
                  String(entry?.id) === movedId
                    ? {
                        ...entry,
                        [effectiveGroupBy]: nextGroupValue,
                      }
                    : entry,
                );
              });

              setDragOverColumnKey(null);
              setDraggingId(null);
            }}
            className={`w-72 min-w-72 rounded border bg-[#111111] ${dragOverColumnKey === column.key ? 'border-border-default' : 'border-[#2A2A2A]'}`}
          >
            <div className="flex items-center justify-between border-b border-border-default px-3 py-2 text-sm">
              <span className="text-text-primary">{column.label}</span>
              <span className="text-text-muted">{column.entries.length}</span>
            </div>

            <div className="flex flex-col gap-2 p-2">
              {column.entries.map((entry) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={(event) => {
                    const id = String(entry?.id);
                    setDraggingId(id);
                    event.dataTransfer.setData('text/plain', id);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverColumnKey(null);
                  }}
                  className={`cursor-grab active:cursor-grabbing ${draggingId && String(entry?.id) === draggingId ? 'opacity-50' : ''}`}
                >
                  {EntryComponent ? (
                    <EntryComponent entry={entry} />
                  ) : (
                    <DefaultBoardEntry
                      entry={entry}
                      visiblePropertySet={visiblePropertySet}
                      statusOptions={statusOptions}
                      priorityOptions={priorityOptions}
                      issueTypeOptions={issueTypeOptions}
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
                        updateEntry(String(entry?.id), { summary: nextSummary });
                      }}
                      onPriorityChange={(nextPriority) => {
                        updateEntry(String(entry?.id), { priority: nextPriority });
                      }}
                      onStatusChange={(nextStatus) => {
                        updateEntry(String(entry?.id), { status: nextStatus });
                      }}
                      onIssueTypeChange={(nextType) => {
                        updateEntry(String(entry?.id), {
                          entryType: nextType,
                          type: nextType,
                          issueType: nextType,
                        });
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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
  const sortFields = [
    { value: 'updated', label: 'Updated' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'summary', label: 'Summary' },
  ];

  const selectedSortLabel =
    sortRules.length > 0
      ? (sortFields.find((field) => field.value === sortRules[0].property)?.label ?? sortRules[0].property)
      : 'None';

  const filterFields = [
    { value: 'summary', label: 'Summary' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'id', label: 'ID' },
  ];
  const filterOperators = [
    { value: 'is', label: 'is', requiresValue: true },
    { value: 'is_not', label: 'is not', requiresValue: true },
    { value: 'contains', label: 'contains', requiresValue: true },
    { value: 'is_empty', label: 'is empty', requiresValue: false },
    { value: 'is_not_empty', label: 'is not empty', requiresValue: false },
  ];
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
              operators={filterOperators}
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
              fields={sortFields}
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

  if (!currentView) {
    return null;
  }

  const viewSettings = currentView.settings ?? {};
  const sortRules = (viewSettings.sortRules as MtSortRule[] | undefined) ?? [];
  const groupableProperties = properties.filter((property) => property.groupable);
  const filterFields = [
    { value: 'summary', label: 'Summary' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'id', label: 'ID' },
  ];
  const filterOperators = [
    { value: 'is', label: 'is', requiresValue: true },
    { value: 'is_not', label: 'is not', requiresValue: true },
    { value: 'contains', label: 'contains', requiresValue: true },
    { value: 'is_empty', label: 'is empty', requiresValue: false },
    { value: 'is_not_empty', label: 'is not empty', requiresValue: false },
  ];
  const sortFields = [
    { value: 'updated', label: 'Updated' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'summary', label: 'Summary' },
  ];
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
          fields={sortFields}
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
          operators={filterOperators}
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
