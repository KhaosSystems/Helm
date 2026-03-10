import { MtSelect, MtSelectItem } from '../../MtSelect';
import MtAvatar from '../../MtAvatar';
import {
  MtBacklogIcon,
  MtCheckIcon,
  MtHighIcon,
  MtInProgressIcon,
  MtLowIcon,
  MtMediumIcon,
  MtOpenIcon,
} from '../../MtIcon';
import { Bookmark, Bug, FileText, ListTodo, Sparkles } from 'lucide-react';

export type MtCollectionAssigneeOption = {
  value: string;
  label: string;
};

export function MtCollectionPriorityBadge({ priority }: { priority?: string }) {
  return <span className="rounded bg-[#1A1A1A] px-2 py-0.5">{priority || 'No priority'}</span>;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', icon: <MtLowIcon /> },
  { value: 'medium', label: 'Medium', icon: <MtMediumIcon /> },
  { value: 'high', label: 'High', icon: <MtHighIcon /> },
];

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog', icon: <MtBacklogIcon /> },
  { value: 'open', label: 'Open', icon: <MtOpenIcon /> },
  { value: 'in progress', label: 'In Progress', icon: <MtInProgressIcon /> },
  { value: 'done', label: 'Done', icon: <MtCheckIcon /> },
];

const ISSUE_TYPE_OPTIONS = [
  { value: 'user story', label: 'User story', icon: <Bookmark size={14} stroke="#60A5FA" /> },
  { value: 'bug', label: 'Bug', icon: <Bug size={14} stroke="#EF4444" /> },
  { value: 'docs', label: 'Docs', icon: <FileText size={14} stroke="#A78BFA" /> },
  { value: 'feature', label: 'Feature', icon: <Sparkles size={14} stroke="#F59E0B" /> },
  { value: 'task', label: 'Task', icon: <ListTodo size={14} stroke="#22C55E" /> },
];

export function MtPrioritySelect({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <MtSelect
      kind="icon"
      variant="ghost"
      placeholder="?"
      value={value}
      onValueChange={onChange}
      options={PRIORITY_OPTIONS}
    />
  );
}

export const MtPrioirtySelect = MtPrioritySelect;

export function MtStateSelect({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <MtSelect
      kind="icon"
      variant="ghost"
      placeholder="?"
      value={value}
      onValueChange={onChange}
      options={STATUS_OPTIONS}
    />
  );
}

export function MtIssueTypeSelect({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  return (
    <MtSelect
      kind="icon"
      variant="ghost"
      placeholder="?"
      value={value}
      onValueChange={onChange}
      options={ISSUE_TYPE_OPTIONS}
    />
  );
}

export function MtCollectionSummaryInput({
  value,
  onChange,
  placeholder = 'Summary...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-text-primary outline-none focus:border-[#2A2A2A]"
    />
  );
}

export function MtCollectionAssigneeDropdown({
  assignee,
  options,
  onChange,
}: {
  assignee?: string;
  options: MtCollectionAssigneeOption[];
  onChange: (value?: string) => void;
}) {
  return (
    <MtSelect
      kind="icon"
      variant="ghost"
      value={assignee}
      placeholder="?"
      onValueChange={(nextValue) => onChange(nextValue === '__unassigned__' ? undefined : nextValue)}
    >
      <MtSelectItem value="__unassigned__">Unassigned</MtSelectItem>
      {options.map((option) => (
        <MtSelectItem key={option.value} value={option.value} icon={<MtAvatar name={option.label} size="xs" />}>
          {option.label}
        </MtSelectItem>
      ))}
    </MtSelect>
  );
}
