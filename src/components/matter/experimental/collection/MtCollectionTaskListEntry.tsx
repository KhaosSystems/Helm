import React from 'react';
import { AlignLeft, GripVertical, MessageSquare, Pencil, Plus } from 'lucide-react';
import MtAvatar from '../../MtAvatar';
import { MtButton } from '../../MtButton';
import { MtCheckbox } from '../../MtCheckbox';
import { MtSubgraphIcon } from '../../MtIcon';
import {
  MtCollectionAssigneeDropdown,
  MtCollectionAssigneeOption,
  MtIssueTypeSelect,
  MtPrioirtySelect,
  MtStateSelect,
} from './MtCollectionEntryControls';
import { useMtCollection } from './MtCollectionContext';
import type { MtCollectionDiscreteValueOption } from './MtCollection';

function MtTriangleCaret({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
      aria-hidden="true"
    >
      <path d="M3 2.25L7 5L3 7.75V2.25Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

type MtCollectionTaskListEntryProps = {
  entry: any;
  visiblePropertySet: Set<string>;
  properties?: Array<{ id: string; label: string }>;
  statusOptions?: string[];
  priorityOptions?: string[];
  issueTypeOptions?: Array<string | MtCollectionDiscreteValueOption>;
  onSummaryChange?: (nextSummary: string) => void;
  onPriorityChange?: (nextPriority: string) => void;
  onStatusChange?: (nextStatus: string) => void;
  onIssueTypeChange?: (nextType: string) => void;
  assigneeOptions?: MtCollectionAssigneeOption[];
  onAssigneeChange?: (nextAssignee?: string) => void;
  onPropertyChange?: (propertyId: string, value: unknown) => void;
  /** Nesting depth for subtask indentation (0 = top-level). */
  depth?: number;
  /** Whether subtask support is active for this collection. */
  subtasksEnabled?: boolean;
  /** Whether this entry has subtasks. */
  hasSubtasks?: boolean;
  /** Number of direct subtasks for this entry. */
  subtaskCount?: number;
  /** Whether the subtask tree below this entry is expanded. */
  isExpanded?: boolean;
  /** Toggle expand/collapse. */
  onToggleExpand?: () => void;
  /** Add a subtask under this entry. */
  onAddSubtask?: () => void;
  dragHandleProps?: {
    ref?: (element: HTMLElement | null) => void;
    attributes?: Record<string, unknown>;
    listeners?: Record<string, unknown>;
  };
};

export function MtCollectionTaskListEntry({
  entry,
  visiblePropertySet,
  properties,
  statusOptions,
  priorityOptions,
  issueTypeOptions,
  onSummaryChange,
  onPriorityChange,
  onStatusChange,
  onIssueTypeChange,
  assigneeOptions,
  onAssigneeChange,
  onPropertyChange,
  depth = 0,
  subtasksEnabled = false,
  hasSubtasks = false,
  subtaskCount = 0,
  isExpanded = false,
  onToggleExpand,
  onAddSubtask,
  dragHandleProps,
}: MtCollectionTaskListEntryProps) {
  const displayId = entry?.id ? String(entry.id) : '';
  // Use the Convex _id as canonical id for selection; fall back to id.
  const entrySelectionId = String(entry?._id ?? entry?.id ?? '');
  const name = entry?.name ? String(entry.name) : entry?.title ? String(entry.title) : '';
  const status = entry?.status ? String(entry.status) : entry?.state ? String(entry.state) : '';
  const priority = entry?.priority ? String(entry.priority) : undefined;
  const assignee = entry?.assignee ? String(entry.assignee) : '';
  const summary = entry?.summary ? String(entry.summary) : '';
  const entryType = String(entry?.entryType ?? entry?.issueType ?? entry?.type ?? '').toLowerCase();
  const commentCount = typeof entry?.commentCount === 'number' ? entry.commentCount : 0;
  const hasDescription = !!(entry?.descriptionPageId || entry?.description);

  const { selectedIds, toggleSelected, onEntryClick } = useMtCollection();
  const isSelected = entrySelectionId ? selectedIds.has(entrySelectionId) : false;

  const [summaryState, setSummaryState] = React.useState(summary);
  const [priorityState, setPriorityState] = React.useState(priority);
  const [statusState, setStatusState] = React.useState(status);
  const [entryTypeState, setEntryTypeState] = React.useState(entryType);
  const [assigneeState, setAssigneeState] = React.useState(assignee || undefined);
  const [isLeftEdgeHovered, setIsLeftEdgeHovered] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(summary);
  const renameInputRef = React.useRef<HTMLInputElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSummaryState(summary);
    setPriorityState(priority);
    setStatusState(status);
    setEntryTypeState(entryType);
    setAssigneeState(assignee || undefined);
    setRenameValue(summary);
  }, [summary, priority, status, entryType, assignee]);

  React.useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus();
  }, [isRenaming]);

  const commitRename = React.useCallback(() => {
    setIsRenaming(false);
    if (renameValue !== summary) {
      setSummaryState(renameValue);
      onSummaryChange?.(renameValue);
    }
  }, [renameValue, summary, onSummaryChange]);

  const startRename = React.useCallback(() => {
    setRenameValue(summaryState);
    setIsRenaming(true);
  }, [summaryState]);

  const showId = visiblePropertySet.has('id');
  const showName = visiblePropertySet.has('name') || visiblePropertySet.has('title');
  const showStatus = visiblePropertySet.has('status') || visiblePropertySet.has('state');
  const showIssueType =
    visiblePropertySet.has('type') || visiblePropertySet.has('entryType') || visiblePropertySet.has('issueType');
  const showPriority = visiblePropertySet.has('priority');
  const showAssignee = visiblePropertySet.has('assignee');

  const trailingProperties = React.useMemo(() => {
    if (!properties || properties.length === 0) {
      return [] as Array<{ id: string; label: string }>;
    }

    const handledPropertyIds = new Set([
      'id',
      'name',
      'title',
      'status',
      'state',
      'type',
      'entryType',
      'issueType',
      'priority',
      'assignee',
      'summary',
    ]);

    return properties.filter(
      (property: { id: string; label: string }) =>
        visiblePropertySet.has(property.id) && !handledPropertyIds.has(property.id),
    );
  }, [properties, visiblePropertySet]);

  const formatPropertyValue = React.useCallback((propertyId: string, rawValue: unknown) => {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return '—';
    }

    if ((propertyId === 'startDate' || propertyId === 'dueDate') && typeof rawValue === 'number') {
      const date = new Date(rawValue);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }

    return String(rawValue);
  }, []);

  const toDateInputValue = React.useCallback((rawValue: unknown) => {
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      return '';
    }

    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  return (
    <div
      ref={rowRef}
      className="group relative flex items-center gap-2 px-4 border-b border-[#2A2A2A] h-[44px] bg-[#141414] text-sm cursor-pointer hover:bg-[#1a1a1a] transition-colors"
      style={{ paddingLeft: depth > 0 ? `${depth * 20 + 16}px` : undefined }}
      tabIndex={0}
      onClick={() => onEntryClick?.(entry)}
      onMouseMove={(event) => {
        if (!dragHandleProps) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const withinLeftZone = event.clientX - bounds.left <= 28;
        setIsLeftEdgeHovered((previous) => (previous === withinLeftZone ? previous : withinLeftZone));
      }}
      onMouseLeave={() => {
        if (dragHandleProps) {
          setIsLeftEdgeHovered(false);
        }
      }}
    >
      <div
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        onClick={(e) => { e.stopPropagation(); entrySelectionId && toggleSelected(entrySelectionId); }}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && entrySelectionId && toggleSelected(entrySelectionId)}
        className={`shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity cursor-pointer`}
      >
        <MtCheckbox checked={isSelected} readOnly />
      </div>

      {dragHandleProps ? (
        <button
          type="button"
          ref={dragHandleProps.ref}
          className={`absolute left-1 shrink-0 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing transition-opacity ${isLeftEdgeHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label="Drag to reorder"
          tabIndex={isLeftEdgeHovered ? 0 : -1}
          {...(dragHandleProps.attributes as any)}
          {...(dragHandleProps.listeners as any)}
        >
          <GripVertical size={14} />
        </button>
      ) : null}

      {subtasksEnabled ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
          className="shrink-0 flex items-center justify-center w-4 h-4 text-text-muted hover:text-text-primary transition-opacity opacity-0 group-hover:opacity-100 data-[has-subtasks=true]:opacity-100"
          data-has-subtasks={hasSubtasks || undefined}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
        >
          <MtTriangleCaret expanded={isExpanded} />
        </button>
      ) : null}

      {showPriority ? (
        <div onClick={(e) => e.stopPropagation()}>
          <MtPrioirtySelect
            value={priorityState}
            options={priorityOptions}
            onChange={(nextPriority) => {
              setPriorityState(nextPriority);
              onPriorityChange?.(nextPriority);
            }}
          />
        </div>
      ) : null}

      {showIssueType ? (
        <div onClick={(e) => e.stopPropagation()}>
          <MtIssueTypeSelect
            value={entryTypeState}
            options={issueTypeOptions}
            onChange={(nextType) => {
              setEntryTypeState(nextType);
              onIssueTypeChange?.(nextType);
            }}
          />
        </div>
      ) : null}

      {showId ? (
        <div className="flex items-center gap-1 text-text-primary min-w-0">
          <span className="truncate text-text-muted text-xs">{displayId}</span>
        </div>
      ) : null}

      {showStatus ? (
        <div onClick={(e) => e.stopPropagation()}>
          <MtStateSelect
            value={statusState}
            options={statusOptions}
            onChange={(nextStatus) => {
              setStatusState(nextStatus);
              onStatusChange?.(nextStatus);
            }}
          />
        </div>
      ) : null}

      {showName ? <span className="text-text-primary truncate max-w-40">{name || '—'}</span> : null}

      <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenameValue(summary); setIsRenaming(false); }
              e.stopPropagation();
            }}
            className="w-full rounded border border-[#2A2A2A] bg-transparent px-1 py-0.5 text-sm text-text-primary outline-none focus:border-border-focus"
          />
        ) : (
          <div className="group/summary flex items-center gap-1 min-w-0">
            <span className="text-sm text-text-primary truncate">{summaryState || 'Untitled'}</span>
            <button
              type="button"
              className="shrink-0 text-text-muted hover:text-text-primary opacity-0 group-hover/summary:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); startRename(); }}
              aria-label="Rename"
            >
              <Pencil size={11} />
            </button>
          </div>
        )}
      </div>

      {subtasksEnabled || hasDescription || commentCount > 0 ? (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {subtasksEnabled && hasSubtasks ? (
            <MtButton
              variant="ghost"
              className="shrink-0 px-2 text-text-muted hover:text-text-primary"
              onClick={onToggleExpand}
              aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              <MtSubgraphIcon size={12} />
              <span className="text-sm">{subtaskCount}</span>
            </MtButton>
          ) : null}

          {hasDescription ? (
            <span className="mx-1 flex items-center text-text-muted shrink-0" title="Has description">
              <AlignLeft size={12} />
            </span>
          ) : null}

          {commentCount > 0 ? (
            <span className="mx-1 flex items-center gap-0.5 text-text-muted shrink-0" title={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}>
              <MessageSquare size={12} />
              <span className="text-[10px]">{commentCount}</span>
            </span>
          ) : null}

            {subtasksEnabled ? (
            <MtButton
              kind="icon"
              variant="ghost"
              className="shrink-0 text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100"
              onClick={onAddSubtask}
              aria-label="Add subtask"
            >
              <Plus size={12} />
            </MtButton>
          ) : null}
        </div>
      ) : null}

      {trailingProperties.length > 0 || showAssignee ? (
        <div className="ml-auto flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {trailingProperties.map((property: { id: string; label: string }) => {
            const isDateProperty = property.id === 'startDate' || property.id === 'dueDate';
            const isTimeEstimateProperty = property.id === 'timeEstimate';

            if (isDateProperty) {
              return (
                <label key={property.id} className="flex items-center gap-1 text-xs text-text-muted">
                  <span>{property.label}:</span>
                  <input
                    type="date"
                    value={toDateInputValue(entry?.[property.id])}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      const nextTimestamp = nextValue ? new Date(`${nextValue}T00:00:00`).getTime() : undefined;
                      onPropertyChange?.(property.id, nextTimestamp);
                    }}
                    className="w-32 rounded border border-[#2A2A2A] bg-transparent px-1 py-0.5 text-xs text-text-primary outline-none"
                  />
                </label>
              );
            }

            if (isTimeEstimateProperty) {
              return (
                <label key={property.id} className="flex items-center gap-1 text-xs text-text-muted">
                  <span>{property.label}:</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={typeof entry?.[property.id] === 'number' ? String(entry[property.id]) : ''}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      const parsedValue = nextValue === '' ? undefined : Number(nextValue);
                      onPropertyChange?.(property.id, Number.isFinite(parsedValue as number) ? parsedValue : undefined);
                    }}
                    className="w-20 rounded border border-[#2A2A2A] bg-transparent px-1 py-0.5 text-xs text-text-primary outline-none"
                  />
                </label>
              );
            }

            return (
              <div key={property.id} className="flex items-center gap-1 text-xs text-text-muted">
                <span>{property.label}:</span>
                <span className="text-text-primary">{formatPropertyValue(property.id, entry?.[property.id])}</span>
              </div>
            );
          })}

          {showAssignee ? (
            <div className="shrink-0">
              {assigneeOptions && assigneeOptions.length > 0 ? (
                <MtCollectionAssigneeDropdown
                  assignee={assigneeState}
                  options={assigneeOptions}
                  onChange={(nextAssignee) => {
                    setAssigneeState(nextAssignee);
                    onAssigneeChange?.(nextAssignee);
                  }}
                />
              ) : (
                <MtAvatar name={assignee} size="xs" />
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
