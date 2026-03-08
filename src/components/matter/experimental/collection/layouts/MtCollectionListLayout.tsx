import { MtCollectionLayoutComponent, MtCollectionLayoutSettingsProps } from '../MtCollection';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ChevronRight, Columns3, Layers3, ListFilter, X } from 'lucide-react';
import React from 'react';
import { MtDrawerMenuItem, MtDrawerMenuPage, MtDrawerMenuSection } from '../MtCollectionViewSettings';
import { useMtCollection } from '../MtCollectionContext';
import { MtButton } from '../../../MtButton';
import {
  applyCollectionQuickFilters,
  applyCollectionSort,
  applyCollectionFilters,
  getCollectionFilterRuleCount,
  getDefaultCollectionFilter,
  isCollectionFilterActive,
} from '../MtCollectionEntryUtils';
import type { MtCollectionFilterState, MtCollectionQuickFilterState } from '../MtCollectionEntryUtils';
import { MtFilterDropdown } from '../../../MtFilter';
import { MtSortDropdown, MtSortRule } from '../../../MtSort';
import { MtDropdown, MtDropdownItem } from '../../../MtDropdown';
import { MtCollectionTaskListEntry } from '../MtCollectionTaskListEntry';

const REQUIRED_VISIBLE_PROPERTY_IDS = ['summary'];

function ensureRequiredVisibleProperties(propertyIds: string[]) {
  return Array.from(new Set([...propertyIds, ...REQUIRED_VISIBLE_PROPERTY_IDS]));
}

function buildListPropertyOptions(properties: Array<{ id: string; label: string; groupable?: boolean }>) {
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

function MtCollectionListGroup({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-6 border-b border-[#2A2A2A] h-11 bg-[#111111] text-sm">
      <span className="text-neutral-300">{label}</span>
      <span className="text-neutral-500">{count}</span>
    </div>
  );
}

/**
 * Virtualized list layout for MtCollection. Using tanstack/react-virtual for virtualization.
 * See https://www.youtube.com/watch?v=DBdo7mmuGx4 for virtualizer intro. Also covers dynamic
 * heights which we might need in the future for other layouts.
 *
 * @note The root should have a non-infinite height and overflow scroll (or auto), otherwise
 * virtualization won't work.
 *
 * ## Custom entry rendering
 *
 * Pass `renderEntry` (via `MtCollectionView.renderEntry` or `MtCollection.renderEntry`) to
 * inject your own row component. The component receives `{ entry }` and **must render at
 * exactly `ENTRY_HEIGHT` px tall** (currently 44px) so the virtualizer stays in sync.
 *
 * TODO: Always keep the current group header visible at the top when scrolling (sticky headers).
 */

/** Hard-coded entry height for virtualization. Custom entries must match this height. */
const ENTRY_HEIGHT = 44;

type FlatRow =
  | { type: 'group'; key: string; label: string; count: number }
  | { type: 'entry'; key: string; entry: any };

function buildRows(entries: any[], groupBy?: string | null): FlatRow[] {
  if (!groupBy) {
    return entries.map((entry) => ({
      type: 'entry',
      key: `entry-${entry.id}`,
      entry,
    }));
  }

  const grouped = new Map<string, any[]>();

  entries.forEach((entry) => {
    const rawValue = entry?.[groupBy as keyof typeof entry];
    const groupKey = rawValue === null || rawValue === undefined || rawValue === '' ? 'Ungrouped' : String(rawValue);
    const groupEntries = grouped.get(groupKey);

    if (groupEntries) {
      groupEntries.push(entry);
      return;
    }

    grouped.set(groupKey, [entry]);
  });

  // Flatten groups into a single array of rows, interleaving group headers with entries.
  const rows: FlatRow[] = [];
  grouped.forEach((groupEntries, groupLabel) => {
    rows.push({
      type: 'group',
      key: `group-${groupBy}-${groupLabel}`,
      label: groupLabel,
      count: groupEntries.length,
    });

    groupEntries.forEach((entry) => {
      rows.push({
        type: 'entry',
        key: `entry-${entry.id}`,
        entry,
      });
    });
  });

  return rows;
}

export const MtCollectionListLayout: MtCollectionLayoutComponent = (props) => {
  const properties = React.useMemo(
    () => (props.properties && props.properties.length > 0 ? props.properties : [{ id: 'id', label: 'ID' }]),
    [props.properties],
  );
  const [entryPatches, setEntryPatches] = React.useState<Record<string, Record<string, unknown>>>({});

  const entryState = React.useMemo(
    () =>
      props.entries.map((entry) => {
        const entryId = String(entry?.id ?? '');
        const patch = entryPatches[entryId];
        return patch ? { ...entry, ...patch } : entry;
      }),
    [props.entries, entryPatches],
  );

  const visiblePropertyIds = React.useMemo(
    () =>
      ensureRequiredVisibleProperties(
        props.viewSettings?.visiblePropertyIds ?? properties.map((property) => property.id),
      ),
    [props.viewSettings?.visiblePropertyIds, properties],
  );
  const visiblePropertySet = React.useMemo(() => new Set(visiblePropertyIds), [visiblePropertyIds]);

  const EntryComponent = props.renderEntry;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const filterState = React.useMemo(
    () => (props.viewSettings?.filter ?? {}) as MtCollectionFilterState,
    [props.viewSettings?.filter],
  );
  const quickFilters = React.useMemo(
    () => (props.viewSettings?.quickFilters as MtCollectionQuickFilterState | undefined) ?? {},
    [props.viewSettings?.quickFilters],
  );
  const sortRules = React.useMemo(
    () => (props.viewSettings?.sortRules as MtSortRule[] | undefined) ?? [],
    [props.viewSettings?.sortRules],
  );
  const selectedSortBy = typeof props.viewSettings?.sortBy === 'string' ? props.viewSettings.sortBy : 'updated';
  const filteredEntries = React.useMemo(
    () => applyCollectionFilters(entryState, filterState),
    [entryState, filterState],
  );
  const toolbarFilteredEntries = React.useMemo(
    () => applyCollectionQuickFilters(filteredEntries, quickFilters),
    [filteredEntries, quickFilters],
  );
  const sortedEntries = React.useMemo(
    () => applyCollectionSort(toolbarFilteredEntries, sortRules, selectedSortBy),
    [toolbarFilteredEntries, sortRules, selectedSortBy],
  );
  const rows = React.useMemo(() => buildRows(sortedEntries, props.groupBy), [sortedEntries, props.groupBy]);

  // TEMP, see: https://github.com/facebook/react/issues/33057
  // eslint-disable-next-line react-hooks/incompatible-library -- opted out of memoization via "use no memo"
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    // WARN: This should be equal to the actual height of list entry, otherwise there will be
    // virtualization glitches. We should ideally measure the actual height of entry and return it here.
    overscan: 5,
    estimateSize: () => ENTRY_HEIGHT,
  });

  return (
    <div id="scroll-container" ref={scrollRef} className="h-full min-h-0 overflow-y-auto">
      {/* This div holds all the virtualized components */}
      <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];

          if (!row) {
            return null;
          }

          return (
            <div
              key={row.key}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {row.type === 'group' ? (
                <MtCollectionListGroup label={row.label} count={row.count} />
              ) : EntryComponent ? (
                <EntryComponent entry={row.entry} />
              ) : (
                <MtCollectionTaskListEntry
                  entry={row.entry}
                  visiblePropertySet={visiblePropertySet}
                  onSummaryChange={(nextSummary) => {
                    const entryId = String(row.entry?.id ?? '');
                    setEntryPatches((previousPatches) => ({
                      ...previousPatches,
                      [entryId]: {
                        ...(previousPatches[entryId] ?? {}),
                        summary: nextSummary,
                      },
                    }));
                  }}
                  onPriorityChange={(nextPriority) => {
                    const entryId = String(row.entry?.id ?? '');
                    setEntryPatches((previousPatches) => ({
                      ...previousPatches,
                      [entryId]: {
                        ...(previousPatches[entryId] ?? {}),
                        priority: nextPriority,
                      },
                    }));
                  }}
                  onStatusChange={(nextStatus) => {
                    const entryId = String(row.entry?.id ?? '');
                    setEntryPatches((previousPatches) => ({
                      ...previousPatches,
                      [entryId]: {
                        ...(previousPatches[entryId] ?? {}),
                        status: nextStatus,
                        state: nextStatus,
                      },
                    }));
                  }}
                  onIssueTypeChange={(nextType) => {
                    const entryId = String(row.entry?.id ?? '');
                    setEntryPatches((previousPatches) => ({
                      ...previousPatches,
                      [entryId]: {
                        ...(previousPatches[entryId] ?? {}),
                        type: nextType,
                        entryType: nextType,
                        issueType: nextType,
                      },
                    }));
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function MtCollectionListLayoutMenu({
  currentView,
  properties,
  viewSettings,
  setViewSettings,
  setCurrentView,
}: MtCollectionLayoutSettingsProps<any>) {
  const filterState = (viewSettings.filter ?? {}) as MtCollectionFilterState;
  const propertyOptions = buildListPropertyOptions(properties);
  const visiblePropertyIds = ensureRequiredVisibleProperties(
    viewSettings.visiblePropertyIds ?? propertyOptions.map((property) => property.id),
  );
  const visiblePropertySet = new Set(visiblePropertyIds);
  const groupableProperties = properties.filter((property) => property.groupable);
  const selectedGroup = currentView.groupBy ?? null;
  const selectedGroupLabel = selectedGroup
    ? (properties.find((property) => property.id === selectedGroup)?.label ?? selectedGroup)
    : 'None';

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

  const activeFilterCount = getCollectionFilterRuleCount(filterState);

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

      <MtDrawerMenuPage id="filter" title="Filter">
        <MtDrawerMenuSection>
          <div className="px-2">
            <MtFilterDropdown
              title="Filter"
              value={currentFilterValue}
              onChange={(nextFilter) => setViewSettings({ filter: nextFilter })}
              fields={filterFields}
              operators={filterOperators}
              variant="ghost"
            />
          </div>
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>

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

      <MtDrawerMenuPage id="group" title="Group">
        <MtDrawerMenuSection title="Group by">
          <MtDrawerMenuItem
            label="None"
            active={selectedGroup === null}
            onClick={() => {
              setCurrentView({
                ...currentView,
                groupBy: null,
              });
            }}
          />
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
              onChange={(nextSortRules) => setViewSettings({ sortRules: nextSortRules })}
              fields={sortFields}
              variant="ghost"
            />
          </div>
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>
    </>
  );
}

MtCollectionListLayout.SettingsMenu = MtCollectionListLayoutMenu;

function MtCollectionListLayoutToolbarActions() {
  const context = useMtCollection();
  const currentView = context.currentView;
  const properties = context.properties;

  if (!currentView) {
    return null;
  }

  const viewSettings = currentView.settings ?? {};
  const sortRules = (viewSettings.sortRules as MtSortRule[] | undefined) ?? [];
  const propertyOptions = buildListPropertyOptions(properties);
  const visiblePropertyIds = ensureRequiredVisibleProperties(
    viewSettings.visiblePropertyIds ?? propertyOptions.map((property) => property.id),
  );

  const groupableProperties = properties.filter((property) => property.groupable);

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

      <MtDropdown title={<Columns3 size={16} stroke="#8D8D8D" />} kind="icon" variant="ghost" showCaret={false}>
        <div className="w-56 p-1">
          {propertyOptions.map((property) => {
            const isVisible = visiblePropertyIds.includes(property.id);
            const nextVisiblePropertyIds = isVisible
              ? visiblePropertyIds.filter((id) => id !== property.id)
              : [...visiblePropertyIds, property.id];

            return (
              <MtDropdownItem
                key={property.id}
                disabled={property.id === 'summary'}
                onSelect={() => {
                  if (property.id === 'summary') {
                    return;
                  }

                  setViewSettings({ visiblePropertyIds: ensureRequiredVisibleProperties(nextVisiblePropertyIds) });
                }}
              >
                <span className="flex items-center justify-between w-full">
                  <span>{property.label}</span>
                  <span className="text-neutral-500 text-xs">{isVisible ? 'Visible' : 'Hidden'}</span>
                </span>
              </MtDropdownItem>
            );
          })}
        </div>
      </MtDropdown>
    </>
  );
}

MtCollectionListLayout.ToolbarActions = MtCollectionListLayoutToolbarActions;
