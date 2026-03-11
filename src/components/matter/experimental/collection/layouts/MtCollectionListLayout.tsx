import {
  MtCollectionDiscreteValueOption,
  MtCollectionLayoutComponent,
  MtCollectionLayoutSettingsProps,
} from '../MtCollection';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ChevronRight, Columns3, Layers3, ListFilter, Plus, X } from 'lucide-react';
import React from 'react';
import { MtDrawerMenuItem, MtDrawerMenuPage, MtDrawerMenuSection } from '../MtCollectionViewSettings';
import { useMtCollection } from '../MtCollectionContext';
import { MtButton } from '../../../MtButton';
import {
  applyCollectionQuickFilters,
  applyCollectionSort,
  applyCollectionFilters,
  getUniqueEntryValues,
  getCollectionFilterRuleCount,
  getDefaultCollectionFilter,
  isCollectionFilterActive,
  COLLECTION_SORT_FIELDS,
  COLLECTION_FILTER_OPERATORS,
  buildCollectionFilterFields,
} from '../MtCollectionEntryUtils';
import type { MtCollectionFilterState, MtCollectionQuickFilterState } from '../MtCollectionEntryUtils';
import { MtFilterDropdown } from '../../../MtFilter';
import { MtSortDropdown, MtSortRule } from '../../../MtSort';
import { MtDropdown, MtDropdownItem } from '../../../MtDropdown';
import { MtCollectionTaskListEntry } from '../MtCollectionTaskListEntry';
import type { MtCollectionAssigneeOption } from '../MtCollectionEntryControls';
import { useMtToast } from '../../../MtToast';

const REQUIRED_VISIBLE_PROPERTY_IDS = ['summary'];

/** Compute a position value for an entry being placed between two neighbors. */
function computePositionBetween(aboveEntry: any | undefined, belowEntry: any | undefined): number {
  const abovePos = typeof aboveEntry?.position === 'number' ? aboveEntry.position : 0;
  const belowPos = typeof belowEntry?.position === 'number' ? belowEntry.position : 0;

  if (!aboveEntry && !belowEntry) return 0;
  if (!aboveEntry) return belowPos + 1;
  if (!belowEntry) return abovePos - 1;
  return (abovePos + belowPos) / 2;
}

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

function getDiscreteValueStrings(values: Array<string | MtCollectionDiscreteValueOption> | undefined) {
  return (values ?? []).map((value) => (typeof value === 'string' ? value : value.value));
}

function MtCollectionListGroup({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-6 border-b border-border-default h-11 bg-[#111111] text-sm">
      <span className="text-text-primary">{label}</span>
      <span className="text-text-muted">{count}</span>
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

type DropTarget = {
  entryId: string;
  position: 'before' | 'after' | 'child';
};

type FlatRow =
  | { type: 'group'; key: string; label: string; count: number }
  | {
      type: 'entry';
      key: string;
      entry: any;
      depth: number;
      hasSubtasks: boolean;
      subtaskCount: number;
      isExpanded: boolean;
    }
  | { type: 'add-subtask'; key: string; parentEntry: any; depth: number };

function buildRows(
  entries: any[],
  groupBy: string | null | undefined,
  subtasksEnabled: boolean,
  expandedIds: Set<string>,
): FlatRow[] {
  if (!subtasksEnabled) {
    if (!groupBy) {
      return entries.map((entry) => ({
        type: 'entry' as const,
        key: `entry-${entry.id ?? entry._id}`,
        entry,
        depth: 0,
        hasSubtasks: false,
        subtaskCount: 0,
        isExpanded: false,
      }));
    }

    const grouped = new Map<string, any[]>();
    entries.forEach((entry) => {
      const rawValue = entry?.[groupBy as keyof typeof entry];
      const groupKey = rawValue === null || rawValue === undefined || rawValue === '' ? 'Ungrouped' : String(rawValue);
      if (!grouped.has(groupKey)) grouped.set(groupKey, []);
      grouped.get(groupKey)!.push(entry);
    });

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
          key: `entry-${entry.id ?? entry._id}`,
          entry,
          depth: 0,
          hasSubtasks: false,
          subtaskCount: 0,
          isExpanded: false,
        });
      });
    });
    return rows;
  }

  // Subtasks-enabled path
  const entryConvexIdSet = new Set(entries.map((e) => String(e._id ?? e.id ?? '')));

  const childrenByParentId = new Map<string, any[]>();
  for (const entry of entries) {
    if (entry.parentId) {
      const parentKey = String(entry.parentId);
      if (!childrenByParentId.has(parentKey)) childrenByParentId.set(parentKey, []);
      childrenByParentId.get(parentKey)!.push(entry);
    }
  }

  const topLevelEntries = entries.filter((entry) => !entry.parentId || !entryConvexIdSet.has(String(entry.parentId)));

  function appendEntry(rows: FlatRow[], entry: any, depth: number) {
    const convexId = String(entry._id ?? entry.id ?? '');
    const children = childrenByParentId.get(convexId) ?? [];
    const hasSubtasks = children.length > 0;
    const isExpanded = expandedIds.has(convexId);

    rows.push({
      type: 'entry',
      key: `entry-${entry.id ?? entry._id}`,
      entry,
      depth,
      hasSubtasks,
      subtaskCount: children.length,
      isExpanded,
    });

    if (isExpanded) {
      for (const child of children) {
        appendEntry(rows, child, depth + 1);
      }
      rows.push({
        type: 'add-subtask',
        key: `add-subtask-${convexId}`,
        parentEntry: entry,
        depth: depth + 1,
      });
    }
  }

  if (!groupBy) {
    const rows: FlatRow[] = [];
    for (const entry of topLevelEntries) {
      appendEntry(rows, entry, 0);
    }
    return rows;
  }

  const grouped = new Map<string, any[]>();
  topLevelEntries.forEach((entry) => {
    const rawValue = entry?.[groupBy as keyof typeof entry];
    const groupKey = rawValue === null || rawValue === undefined || rawValue === '' ? 'Ungrouped' : String(rawValue);
    if (!grouped.has(groupKey)) grouped.set(groupKey, []);
    grouped.get(groupKey)!.push(entry);
  });

  const rows: FlatRow[] = [];
  grouped.forEach((groupEntries, groupLabel) => {
    rows.push({
      type: 'group',
      key: `group-${groupBy}-${groupLabel}`,
      label: groupLabel,
      count: groupEntries.length,
    });
    for (const entry of groupEntries) {
      appendEntry(rows, entry, 0);
    }
  });
  return rows;
}

function includeAncestorEntries(
  visibleEntries: any[],
  allEntries: any[],
  sortRules: MtSortRule[] | undefined,
  fallbackSortBy: string,
) {
  if (visibleEntries.length === 0 || allEntries.length === 0) {
    return visibleEntries;
  }

  const entryById = new Map(allEntries.map((entry) => [String(entry?._id ?? entry?.id ?? ''), entry]));
  const includedIds = new Set<string>();

  const includeEntry = (entry: any) => {
    const entryId = String(entry?._id ?? entry?.id ?? '');
    if (entryId) {
      includedIds.add(entryId);
    }
  };

  visibleEntries.forEach((entry) => {
    includeEntry(entry);

    const visitedParentIds = new Set<string>();
    let parentId = entry?.parentId ? String(entry.parentId) : '';

    while (parentId && !visitedParentIds.has(parentId)) {
      visitedParentIds.add(parentId);
      const parentEntry = entryById.get(parentId);
      if (!parentEntry) {
        break;
      }

      includeEntry(parentEntry);
      parentId = parentEntry?.parentId ? String(parentEntry.parentId) : '';
    }
  });

  const sortedEntries = applyCollectionSort(allEntries, sortRules, fallbackSortBy);
  return sortedEntries.filter((entry) => includedIds.has(String(entry?._id ?? entry?.id ?? '')));
}

function DropIndicatorLine({ position, indent = 0 }: { position: 'before' | 'after'; indent?: number }) {
  return (
    <div
      className={`absolute right-0 h-0.5 bg-blue-500 pointer-events-none z-10 ${
        position === 'before' ? 'top-0' : 'bottom-0'
      }`}
      style={{ left: indent > 0 ? `${indent}px` : 0 }}
    >
      {indent > 0 && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />}
    </div>
  );
}

function DraggableDroppableRow({
  id,
  top,
  depth,
  dropTarget,
  activeDragId,
  children,
}: {
  id: string;
  top: number;
  depth: number;
  dropTarget: DropTarget | null;
  activeDragId: string | null;
  children: (dragHandleProps: {
    ref: (element: HTMLElement | null) => void;
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, setActivatorNodeRef, isDragging } = useDraggable({ id });
  const { setNodeRef: setDropRef } = useDroppable({ id });

  const nodeRef = React.useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

  const isDropTarget = dropTarget?.entryId === id && activeDragId !== id;
  const isDropBefore = isDropTarget && dropTarget.position === 'before';
  const isDropAfter = isDropTarget && dropTarget.position === 'after';
  const isDropChild = isDropTarget && dropTarget.position === 'child';

  // Indent for the drop indicator: match entry depth, or go one level deeper for child drops
  const indicatorIndent = isDropChild ? (depth + 1) * 20 + 16 : depth * 20 + 16;

  return (
    <div
      ref={nodeRef}
      className="absolute left-0 w-full"
      style={{
        top,
        transition: isDragging ? 'none' : 'top 200ms ease, opacity 150ms ease',
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? -1 : undefined,
      }}
    >
      {isDropBefore && <DropIndicatorLine position="before" indent={indicatorIndent} />}
      <div
        className={`transition-shadow duration-150 ${isDropChild ? 'ring-2 ring-blue-500 ring-inset rounded-sm' : ''}`}
      >
        {children({
          ref: setActivatorNodeRef,
          attributes: attributes as unknown as Record<string, unknown>,
          listeners: listeners as unknown as Record<string, unknown>,
        })}
      </div>
      {isDropAfter && <DropIndicatorLine position="after" indent={indicatorIndent} />}
    </div>
  );
}

export const MtCollectionListLayout: MtCollectionLayoutComponent = (props) => {
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
  const [entryPatches, setEntryPatches] = React.useState<Record<string, Record<string, unknown>>>({});
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [orderedEntryIds, setOrderedEntryIds] = React.useState<string[]>([]);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);
  const dropTargetRef = React.useRef<DropTarget | null>(null);
  const dragMoveRafRef = React.useRef<number | null>(null);
  const subtasksEnabled = Boolean(props.subtasksEnabled);

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
  const assigneeOptions = React.useMemo<MtCollectionAssigneeOption[]>(() => {
    if (props.assigneeOptions && props.assigneeOptions.length > 0) {
      return props.assigneeOptions;
    }

    return getUniqueEntryValues(entryState, 'assignee').map((value) => ({
      value,
      label: value,
    }));
  }, [entryState, props.assigneeOptions]);

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
  const entriesForRows = React.useMemo(
    () =>
      subtasksEnabled ? includeAncestorEntries(sortedEntries, entryState, sortRules, selectedSortBy) : sortedEntries,
    [entryState, selectedSortBy, sortRules, sortedEntries, subtasksEnabled],
  );
  const hasSortRules = sortRules.length > 0;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const toastCtx = useMtToast();
  const prevHasSortRulesRef = React.useRef(hasSortRules);

  React.useEffect(() => {
    const currentIds = entriesForRows.map((entry) => String(entry?.id ?? ''));
    const prevHadSortRules = prevHasSortRulesRef.current;
    prevHasSortRulesRef.current = hasSortRules;

    setOrderedEntryIds((previous) => {
      // When sort rules are active, always follow the sort-determined order.
      if (hasSortRules) {
        return currentIds;
      }
      // When transitioning away from sort rules, re-initialize from position-sorted data
      // instead of preserving the stale sort-rule order.
      if (prevHadSortRules) {
        return currentIds;
      }
      const preserved = previous.filter((id) => currentIds.includes(id));
      const appended = currentIds.filter((id) => !preserved.includes(id));
      return [...preserved, ...appended];
    });
  }, [entriesForRows, hasSortRules]);

  const entryById = React.useMemo(
    () => new Map(entriesForRows.map((entry) => [String(entry?.id ?? ''), entry])),
    [entriesForRows],
  );
  const orderedEntriesForRows = React.useMemo(
    () => orderedEntryIds.map((id) => entryById.get(id)).filter((entry): entry is any => Boolean(entry)),
    [entryById, orderedEntryIds],
  );
  const rows = React.useMemo(
    () => buildRows(orderedEntriesForRows, props.groupBy, subtasksEnabled, expandedIds),
    [orderedEntriesForRows, props.groupBy, subtasksEnabled, expandedIds],
  );
  const toggleExpanded = React.useCallback((convexId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(convexId)) {
        next.delete(convexId);
      } else {
        next.add(convexId);
      }
      return next;
    });
  }, []);

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
    [props],
  );

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      // Cancel any pending frame to avoid stacking updates
      if (dragMoveRafRef.current !== null) {
        cancelAnimationFrame(dragMoveRafRef.current);
      }

      dragMoveRafRef.current = requestAnimationFrame(() => {
        dragMoveRafRef.current = null;
        const { over, active } = event;
        if (!over || String(over.id) === String(active.id)) {
          if (dropTargetRef.current !== null) {
            dropTargetRef.current = null;
            setDropTarget(null);
          }
          return;
        }

        const overId = String(over.id);
        const overRect = over.rect;

        const activeTranslated = active.rect.current.translated;
        if (!activeTranslated) {
          return;
        }
        const activeCenterY = activeTranslated.top + activeTranslated.height / 2;
        const fraction = Math.max(0, Math.min(1, (activeCenterY - overRect.top) / overRect.height));

        let position: 'before' | 'after' | 'child';
        if (subtasksEnabled) {
          if (fraction < 0.25) position = 'before';
          else if (fraction > 0.75) position = 'after';
          else position = 'child';
        } else {
          position = fraction < 0.5 ? 'before' : 'after';
        }

        const prev = dropTargetRef.current;
        if (prev?.entryId !== overId || prev?.position !== position) {
          const newTarget: DropTarget = { entryId: overId, position };
          dropTargetRef.current = newTarget;
          setDropTarget(newTarget);
        }
      });
    },
    [subtasksEnabled],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const activeId = String(event.active.id ?? '');
      const target = dropTargetRef.current;

      if (!target || !activeId || activeId === target.entryId) {
        dropTargetRef.current = null;
        setDropTarget(null);
        return;
      }

      const { entryId: targetId, position } = target;

      if (position === 'child' && subtasksEnabled) {
        // Re-parent: make the dragged entry a child of the target
        const activeEntry = entryById.get(activeId);
        const targetEntry = entryById.get(targetId);
        if (activeEntry && targetEntry) {
          const targetConvexId = String(targetEntry._id ?? targetEntry.id ?? '');
          applyEntryPatch(activeEntry, { parentId: targetConvexId });
          // Expand the target so the moved subtask is visible
          setExpandedIds((prev) => new Set([...prev, targetConvexId]));
        }
      } else {
        // Block reordering when sort rules are active.
        if (hasSortRules) {
          toastCtx?.toast('Manual sorting is not available when a sort rule is applied');
          dropTargetRef.current = null;
          setDropTarget(null);
          return;
        }

        // Build the new visual order with active entry moved to its target position.
        const filtered = orderedEntryIds.filter((id) => id !== activeId);
        const targetIndexInFiltered = filtered.indexOf(targetId);
        const insertIndex = position === 'before' ? targetIndexInFiltered : targetIndexInFiltered + 1;
        const newOrder = [...filtered];
        newOrder.splice(insertIndex, 0, activeId);

        // Check if any visible entry is missing an explicit position. When this is
        // the case we need to batch-assign positions to ALL entries based on their
        // current visual order before we can compute meaningful midpoints.
        const needsBatch = newOrder.some((id) => {
          const e = entryById.get(id);
          return typeof e?.position !== 'number';
        });

        const activeEntry = entryById.get(activeId);

        if (needsBatch) {
          // Batch-assign: top entry gets highest position, bottom gets lowest.
          const total = newOrder.length;
          newOrder.forEach((id, idx) => {
            const e = entryById.get(id);
            if (e) {
              applyEntryPatch(e, { position: (total - idx) * 1000 });
            }
          });
        } else {
          // All entries have positions – compute the midpoint for just the dragged entry.
          const aboveId = insertIndex > 0 ? newOrder[insertIndex - 1] : undefined;
          const belowId = insertIndex < newOrder.length - 1 ? newOrder[insertIndex + 1] : undefined;
          const aboveEntry = aboveId ? entryById.get(aboveId) : undefined;
          const belowEntry = belowId ? entryById.get(belowId) : undefined;
          const newPosition = computePositionBetween(aboveEntry, belowEntry);
          if (activeEntry) {
            applyEntryPatch(activeEntry, { position: newPosition });
          }
        }

        // Optimistic visual update
        setOrderedEntryIds(newOrder);

        // Handle group reassignment when dragging between groups
        if (props.groupBy) {
          const overEntry = entryById.get(targetId);
          if (activeEntry && overEntry) {
            const activeGroupValue = activeEntry?.[props.groupBy];
            const overGroupValue = overEntry?.[props.groupBy];
            if (activeGroupValue !== overGroupValue) {
              applyEntryPatch(activeEntry, { [props.groupBy]: overGroupValue ?? null });
            }
          }
        }

        // If subtasks enabled, update parent to match target's parent
        if (subtasksEnabled) {
          const targetEntry = entryById.get(targetId);
          if (activeEntry && targetEntry) {
            const activeParentId = activeEntry?.parentId ? String(activeEntry.parentId) : null;
            const targetParentId = targetEntry?.parentId ? String(targetEntry.parentId) : null;
            if (activeParentId !== targetParentId) {
              applyEntryPatch(activeEntry, { parentId: targetParentId });
            }
          }
        }
      }

      dropTargetRef.current = null;
      setDropTarget(null);
    },
    [applyEntryPatch, entryById, hasSortRules, orderedEntryIds, props.groupBy, subtasksEnabled, toastCtx],
  );

  // TEMP, see: https://github.com/facebook/react/issues/33057
  // eslint-disable-next-line react-hooks/incompatible-library -- opted out of memoization via "use no memo"
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    // WARN: This should be equal to the actual height of list entry, otherwise there will be
    // virtualization glitches. We should ideally measure the actual height of entry and return it here.
    overscan: activeDragId ? 20 : 5,
    estimateSize: () => ENTRY_HEIGHT,
  });

  const renderRowContent = React.useCallback(
    (row: FlatRow) =>
      row.type === 'group' ? (
        <MtCollectionListGroup label={row.label} count={row.count} />
      ) : row.type === 'add-subtask' ? (
        <div
          className="flex items-center border-b border-[#2A2A2A] h-[44px] bg-[#141414] text-sm"
          style={{ paddingLeft: `${row.depth * 20 + 16}px` }}
        >
          <button
            type="button"
            className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors text-xs"
            onClick={() => props.onAddSubtask?.(row.parentEntry)}
          >
            <Plus size={12} />
            Add subtask
          </button>
        </div>
      ) : EntryComponent ? (
        <EntryComponent entry={row.entry} />
      ) : (
        <MtCollectionTaskListEntry
          entry={row.entry}
          properties={properties}
          visiblePropertySet={visiblePropertySet}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          issueTypeOptions={issueTypeOptions}
          assigneeOptions={assigneeOptions}
          depth={row.depth}
          subtasksEnabled={subtasksEnabled}
          hasSubtasks={row.hasSubtasks}
          subtaskCount={row.subtaskCount}
          isExpanded={row.isExpanded}
          onToggleExpand={() => toggleExpanded(String(row.entry._id ?? row.entry.id ?? ''))}
          onAddSubtask={() => props.onAddSubtask?.(row.entry)}
          onSummaryChange={(nextSummary) => {
            applyEntryPatch(row.entry, { summary: nextSummary });
          }}
          onPriorityChange={(nextPriority) => {
            applyEntryPatch(row.entry, { priority: nextPriority });
          }}
          onStatusChange={(nextStatus) => {
            applyEntryPatch(row.entry, { status: nextStatus, state: nextStatus });
          }}
          onIssueTypeChange={(nextType) => {
            applyEntryPatch(row.entry, {
              type: nextType,
              entryType: nextType,
              issueType: nextType,
            });
          }}
          onPropertyChange={(propertyId, value) => {
            applyEntryPatch(row.entry, { [propertyId]: value });
          }}
          onAssigneeChange={(nextAssignee) => {
            applyEntryPatch(row.entry, { assignee: nextAssignee });
          }}
        />
      ),
    [
      EntryComponent,
      applyEntryPatch,
      assigneeOptions,
      issueTypeOptions,
      priorityOptions,
      properties,
      props,
      statusOptions,
      subtasksEnabled,
      toggleExpanded,
      visiblePropertySet,
    ],
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={{
          droppable: { strategy: MeasuringStrategy.Always },
        }}
        onDragStart={(event) => {
          setActiveDragId(String(event.active.id ?? ''));
        }}
        onDragMove={handleDragMove}
        onDragCancel={() => {
          setActiveDragId(null);
          dropTargetRef.current = null;
          setDropTarget(null);
          if (dragMoveRafRef.current !== null) {
            cancelAnimationFrame(dragMoveRafRef.current);
            dragMoveRafRef.current = null;
          }
        }}
        onDragEnd={(event) => {
          handleDragEnd(event);
          setActiveDragId(null);
        }}
        autoScroll
      >
        <div id="scroll-container" ref={scrollRef} className="h-full min-h-0 overflow-y-auto">
          <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];

              if (!row) {
                return null;
              }

              if (row.type !== 'entry') {
                return (
                  <div
                    key={row.key}
                    className="absolute left-0 w-full"
                    style={{ top: virtualRow.start, transition: 'top 200ms ease' }}
                  >
                    {renderRowContent(row)}
                  </div>
                );
              }

              const rowEntryId = String(row.entry?.id ?? '');

              return (
                <DraggableDroppableRow
                  key={row.key}
                  id={rowEntryId}
                  top={virtualRow.start}
                  depth={row.depth}
                  dropTarget={dropTarget}
                  activeDragId={activeDragId}
                >
                  {(dragHandleProps) => {
                    if (EntryComponent) {
                      return <EntryComponent entry={row.entry} />;
                    }

                    return (
                      <MtCollectionTaskListEntry
                        entry={row.entry}
                        properties={properties}
                        visiblePropertySet={visiblePropertySet}
                        statusOptions={statusOptions}
                        priorityOptions={priorityOptions}
                        issueTypeOptions={issueTypeOptions}
                        assigneeOptions={assigneeOptions}
                        depth={row.depth}
                        subtasksEnabled={subtasksEnabled}
                        hasSubtasks={row.hasSubtasks}
                        subtaskCount={row.subtaskCount}
                        isExpanded={row.isExpanded}
                        dragHandleProps={dragHandleProps}
                        onToggleExpand={() => toggleExpanded(String(row.entry._id ?? row.entry.id ?? ''))}
                        onAddSubtask={() => props.onAddSubtask?.(row.entry)}
                        onSummaryChange={(nextSummary) => {
                          applyEntryPatch(row.entry, { summary: nextSummary });
                        }}
                        onPriorityChange={(nextPriority) => {
                          applyEntryPatch(row.entry, { priority: nextPriority });
                        }}
                        onStatusChange={(nextStatus) => {
                          applyEntryPatch(row.entry, { status: nextStatus, state: nextStatus });
                        }}
                        onIssueTypeChange={(nextType) => {
                          applyEntryPatch(row.entry, {
                            type: nextType,
                            entryType: nextType,
                            issueType: nextType,
                          });
                        }}
                        onPropertyChange={(propertyId, value) => {
                          applyEntryPatch(row.entry, { [propertyId]: value });
                        }}
                        onAssigneeChange={(nextAssignee) => {
                          applyEntryPatch(row.entry, { assignee: nextAssignee });
                        }}
                      />
                    );
                  }}
                </DraggableDroppableRow>
              );
            })}
          </div>
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {activeDragId
            ? (() => {
                const activeEntry = entryById.get(activeDragId);
                if (!activeEntry) return null;
                return (
                  <div className="opacity-90 pointer-events-none bg-[#141414] border border-[#2A2A2A] rounded shadow-lg">
                    <MtCollectionTaskListEntry
                      entry={activeEntry}
                      properties={properties}
                      visiblePropertySet={visiblePropertySet}
                      statusOptions={statusOptions}
                      priorityOptions={priorityOptions}
                      issueTypeOptions={issueTypeOptions}
                      assigneeOptions={assigneeOptions}
                      depth={0}
                      subtasksEnabled={false}
                    />
                  </div>
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </>
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
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);
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
  const selectedSortLabel =
    sortRules.length > 0
      ? (COLLECTION_SORT_FIELDS.find((field) => field.value === sortRules[0].property)?.label ?? sortRules[0].property)
      : 'None';

  const activeFilterCount = getCollectionFilterRuleCount(filterState);

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
              operators={COLLECTION_FILTER_OPERATORS}
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
              fields={COLLECTION_SORT_FIELDS}
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
  const filterFields = React.useMemo(() => buildCollectionFilterFields(properties), [properties]);

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
                  <span className="text-text-muted text-xs">{isVisible ? 'Visible' : 'Hidden'}</span>
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
