import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

import { MtMenu } from './MtMenu';

/**
 * `MtMenu` is a single modular primitive that replaces `MtSelect`, `MtDropdown`,
 * and `MtContextMenu`. Rather than three separate opinionated components each with
 * their own trigger, portal, and item model, `MtMenu` gives you a composable surface
 * you can wire to any trigger — a button, a right-click, a keyboard shortcut, anything.
 */
const meta = {
  title: 'Experimental/Menu',
  component: MtMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof MtMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// As Context Menu
// ---------------------------------------------------------------------------

export const AsContextMenu: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [point, setPoint] = useState({ x: 0, y: 0 });
    const [last, setLast] = useState('—');

    return (
      <div className="flex flex-col gap-3 p-6">
        <div
          className="cursor-default select-none rounded-xl border border-border-default bg-surface-elevated p-10 text-sm text-text-muted"
          onContextMenu={(e) => {
            e.preventDefault();
            setPoint({ x: e.clientX, y: e.clientY });
            setOpen(true);
          }}
        >
          Right-click anywhere in this area
        </div>
        <div className="text-xs text-text-muted">Last: {last}</div>

        <MtMenu open={open} x={point.x} y={point.y} onOpenChange={setOpen} renderHeader={() => 'my-file.ts'}>
          <MtMenu.Item shortcut="⌘O" onSelect={() => setLast('Open')}>Open</MtMenu.Item>
          <MtMenu.Item shortcut="⌘R" onSelect={() => setLast('Rename')}>Rename</MtMenu.Item>
          <MtMenu.Separator />
          <MtMenu.Submenu label="Share">
            <MtMenu.Item onSelect={() => setLast('Copy Link')}>Copy Link</MtMenu.Item>
            <MtMenu.Item onSelect={() => setLast('Invite People')}>Invite People</MtMenu.Item>
          </MtMenu.Submenu>
          <MtMenu.Item disabled>Archive</MtMenu.Item>
          <MtMenu.Separator />
          <MtMenu.Item tone="destructive" onSelect={() => setLast('Delete')}>Delete</MtMenu.Item>
        </MtMenu>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// As Dropdown
// ---------------------------------------------------------------------------

export const AsDropdown: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [point, setPoint] = useState({ x: 0, y: 0 });
    const [last, setLast] = useState('—');

    function openFromTrigger() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPoint({ x: rect.left, y: rect.bottom + 4 });
      setOpen(true);
    }

    return (
      <div className="flex flex-col gap-3 p-6">
        <div>
          <button
            ref={triggerRef}
            type="button"
            onClick={openFromTrigger}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-elevated px-3 py-1.5 text-sm"
          >
            Actions <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
        <div className="text-xs text-text-muted">Last: {last}</div>

        <MtMenu open={open} x={point.x} y={point.y} onOpenChange={setOpen}>
          <MtMenu.Item onSelect={() => setLast('New')}>New</MtMenu.Item>
          <MtMenu.Item onSelect={() => setLast('Duplicate')}>Duplicate</MtMenu.Item>
          <MtMenu.Separator />
          <MtMenu.Item onSelect={() => setLast('Export')}>Export</MtMenu.Item>
          <MtMenu.Item tone="destructive" onSelect={() => setLast('Delete')}>Delete</MtMenu.Item>
        </MtMenu>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// As Select
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const AsSelect: Story = {
  render: () => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [point, setPoint] = useState({ x: 0, y: 0 });
    const [value, setValue] = useState('backlog');

    const selected = STATUS_OPTIONS.find((o) => o.value === value);

    function openFromTrigger() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPoint({ x: rect.left, y: rect.bottom + 4 });
      setOpen(true);
    }

    return (
      <div className="flex flex-col gap-3 p-6">
        <div>
          <button
            ref={triggerRef}
            type="button"
            onClick={openFromTrigger}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface-elevated px-3 py-1.5 text-sm"
          >
            {selected?.label ?? 'Select status'} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>

        <MtMenu open={open} x={point.x} y={point.y} onOpenChange={setOpen}>
          {STATUS_OPTIONS.map((option) => (
            <MtMenu.Item
              key={option.value}
              icon={value === option.value ? <Check className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5" />}
              onSelect={() => setValue(option.value)}
            >
              {option.label}
            </MtMenu.Item>
          ))}
        </MtMenu>
      </div>
    );
  },
};