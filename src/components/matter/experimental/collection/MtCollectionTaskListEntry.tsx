import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';
import MtAvatar from '../../MtAvatar';
import { MtCheckbox } from '../../MtCheckbox';
import {
  MtCollectionAssigneeDropdown,
  MtCollectionAssigneeOption,
  MtCollectionSummaryInput,
  MtIssueTypeSelect,
  MtIssueTypePreview,
  MtPrioirtySelect,
  MtStateSelect,
} from './MtCollectionEntryControls';
import { useMtCollection } from './MtCollectionContext';
import type { MtCollectionDiscreteValueOption } from './MtCollection';

type MtCollectionTaskListEntryProps = {
  entry: any;
  visiblePropertySet: Set<string>;
  statusOptions?: string[];
  priorityOptions?: string[];
  issueTypeOptions?: Array<string | MtCollectionDiscreteValueOption>;
  onSummaryChange?: (nextSummary: string) => void;
  onPriorityChange?: (nextPriority: string) => void;
  onStatusChange?: (nextStatus: string) => void;
  onIssueTypeChange?: (nextType: string) => void;
  assigneeOptions?: MtCollectionAssigneeOption[];
  onAssigneeChange?: (nextAssignee?: string) => void;
  /** Nesting depth for subtask indentation (0 = top-level). */
  depth?: number;
  /** Whether subtask support is active for this collection. */
  subtasksEnabled?: boolean;
  /** Whether this entry has subtasks. */
  hasSubtasks?: boolean;
  /** Whether the subtask tree below this entry is expanded. */
  isExpanded?: boolean;
  /** Toggle expand/collapse. */
  onToggleExpand?: () => void;
};

export function MtCollectionTaskListEntry({
  entry,
  visiblePropertySet,
  statusOptions,
  priorityOptions,
  issueTypeOptions,
  onSummaryChange,
  onPriorityChange,
  onStatusChange,
  onIssueTypeChange,
  assigneeOptions,
  onAssigneeChange,
  depth = 0,
  subtasksEnabled = false,
  hasSubtasks = false,
  isExpanded = false,
  onToggleExpand,
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

  const { selectedIds, toggleSelected } = useMtCollection();
  const isSelected = entrySelectionId ? selectedIds.has(entrySelectionId) : false;

  const [summaryState, setSummaryState] = React.useState(summary);
  const [priorityState, setPriorityState] = React.useState(priority);
  const [statusState, setStatusState] = React.useState(status);
  const [entryTypeState, setEntryTypeState] = React.useState(entryType);
  const [assigneeState, setAssigneeState] = React.useState(assignee || undefined);

  React.useEffect(() => {
    setSummaryState(summary);
    setPriorityState(priority);
    setStatusState(status);
    setEntryTypeState(entryType);
    setAssigneeState(assignee || undefined);
  }, [summary, priority, status, entryType, assignee]);

  const showId = visiblePropertySet.has('id');
  const showName = visiblePropertySet.has('name') || visiblePropertySet.has('title');
  const showStatus = visiblePropertySet.has('status') || visiblePropertySet.has('state');
  const showIssueType =
    visiblePropertySet.has('type') || visiblePropertySet.has('entryType') || visiblePropertySet.has('issueType');
  const showPriority = visiblePropertySet.has('priority');
  const showAssignee = visiblePropertySet.has('assignee');

  return (
    <div
      className="group flex items-center gap-2 px-4 border-b border-[#2A2A2A] h-[44px] bg-[#141414] text-sm"
      style={{ paddingLeft: depth > 0 ? `${depth * 20 + 16}px` : undefined }}
    >
      <div
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={0}
        onClick={() => entrySelectionId && toggleSelected(entrySelectionId)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && entrySelectionId && toggleSelected(entrySelectionId)}
        className={`shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity cursor-pointer`}
      >
        <MtCheckbox checked={isSelected} />
      </div>

      {subtasksEnabled ? (
        <button
          type="button"
          onClick={onToggleExpand}
          className={`shrink-0 flex items-center justify-center w-4 h-4 text-text-muted hover:text-text-primary transition-opacity ${hasSubtasks ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : null}

      {showPriority ? (
        <MtPrioirtySelect
          value={priorityState}
          options={priorityOptions}
          onChange={(nextPriority) => {
            setPriorityState(nextPriority);
            onPriorityChange?.(nextPriority);
          }}
        />
      ) : null}

      {showIssueType ? (
        <MtIssueTypeSelect
          value={entryTypeState}
          options={issueTypeOptions}
          onChange={(nextType) => {
            setEntryTypeState(nextType);
            onIssueTypeChange?.(nextType);
          }}
        />
      ) : null}

      {showId ? (
        <div className="flex items-center gap-1 text-text-primary min-w-0">
          {!showIssueType ? <MtIssueTypePreview value={entryType} options={issueTypeOptions} size={14} /> : null}
          <span className="truncate">{displayId}</span>
        </div>
      ) : null}

      {showStatus ? (
        <MtStateSelect
          value={statusState}
          options={statusOptions}
          onChange={(nextStatus) => {
            setStatusState(nextStatus);
            onStatusChange?.(nextStatus);
          }}
        />
      ) : null}

      {showName ? <span className="text-text-primary truncate max-w-40">{name || '—'}</span> : null}

      <div className="flex-1 min-w-0">
        <MtCollectionSummaryInput
          value={summaryState}
          onChange={(nextSummary) => {
            setSummaryState(nextSummary);
            onSummaryChange?.(nextSummary);
          }}
        />
      </div>

      {showAssignee ? (
        assigneeOptions && assigneeOptions.length > 0 ? (
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
        )
      ) : null}
    </div>
  );
}
