import { Bookmark, Bug, FileText, ListTodo, Sparkles } from 'lucide-react';
import React from 'react';
import MtAvatar from '../../MtAvatar';
import { MtCheckbox } from '../../MtCheckbox';
import {
  MtCollectionSummaryInput,
  MtIssueTypeSelect,
  MtPrioirtySelect,
  MtStateSelect,
} from './MtCollectionEntryControls';

type MtCollectionTaskListEntryProps = {
  entry: any;
  visiblePropertySet: Set<string>;
  onSummaryChange?: (nextSummary: string) => void;
  onPriorityChange?: (nextPriority: string) => void;
  onStatusChange?: (nextStatus: string) => void;
  onIssueTypeChange?: (nextType: string) => void;
};

export function MtCollectionTaskListEntry({
  entry,
  visiblePropertySet,
  onSummaryChange,
  onPriorityChange,
  onStatusChange,
  onIssueTypeChange,
}: MtCollectionTaskListEntryProps) {
  const displayId = entry?.id ? String(entry.id) : '';
  const name = entry?.name ? String(entry.name) : entry?.title ? String(entry.title) : '';
  const status = entry?.status ? String(entry.status) : entry?.state ? String(entry.state) : '';
  const priority = entry?.priority ? String(entry.priority) : undefined;
  const assignee = entry?.assignee ? String(entry.assignee) : '';
  const summary = entry?.summary ? String(entry.summary) : '';
  const entryType = String(entry?.entryType ?? entry?.issueType ?? entry?.type ?? 'user story').toLowerCase();
  const isSelected = Boolean(entry?.selected);

  const [summaryState, setSummaryState] = React.useState(summary);
  const [priorityState, setPriorityState] = React.useState(priority);
  const [statusState, setStatusState] = React.useState(status);
  const [entryTypeState, setEntryTypeState] = React.useState(entryType);

  React.useEffect(() => {
    setSummaryState(summary);
    setPriorityState(priority);
    setStatusState(status);
    setEntryTypeState(entryType);
  }, [summary, priority, status, entryType]);

  const showId = visiblePropertySet.has('id');
  const showName = visiblePropertySet.has('name') || visiblePropertySet.has('title');
  const showStatus = visiblePropertySet.has('status') || visiblePropertySet.has('state');
  const showIssueType =
    visiblePropertySet.has('type') || visiblePropertySet.has('entryType') || visiblePropertySet.has('issueType');
  const showPriority = visiblePropertySet.has('priority');
  const showAssignee = visiblePropertySet.has('assignee');

  const EntryTypeIcon = (() => {
    switch (entryType) {
      case 'bug':
        return Bug;
      case 'docs':
      case 'documentation':
        return FileText;
      case 'feature':
        return Sparkles;
      case 'task':
        return ListTodo;
      case 'user story':
      default:
        return Bookmark;
    }
  })();

  return (
    <div className="group flex items-center gap-2 px-4 border-b border-[#2A2A2A] h-[44px] bg-[#141414] text-sm">
      <div className={`${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        <MtCheckbox checked={isSelected} />
      </div>

      {showPriority ? (
        <MtPrioirtySelect
          value={priorityState}
          onChange={(nextPriority) => {
            setPriorityState(nextPriority);
            onPriorityChange?.(nextPriority);
          }}
        />
      ) : null}

      {showIssueType ? (
        <MtIssueTypeSelect
          value={entryTypeState}
          onChange={(nextType) => {
            setEntryTypeState(nextType);
            onIssueTypeChange?.(nextType);
          }}
        />
      ) : null}

      {showId ? (
        <div className="flex items-center gap-1 text-text-primary min-w-0">
          {!showIssueType ? <EntryTypeIcon size={14} stroke="#608a23" /> : null}
          <span className="truncate">{displayId}</span>
        </div>
      ) : null}

      {showStatus ? (
        <MtStateSelect
          value={statusState}
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

      {showAssignee ? <MtAvatar name={assignee} size="xs" /> : null}
    </div>
  );
}
