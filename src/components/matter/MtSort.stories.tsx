import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MtSortDropdown, type MtSortRule } from './MtSort';

const meta = {
  title: 'Input/Sort',
  component: MtSortDropdown,
  tags: ['autodocs'],
} satisfies Meta<typeof MtSortDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

const fields = [
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
];

const singleRule: MtSortRule[] = [{ property: 'priority', direction: 'desc' }];
const multiRule: MtSortRule[] = [
  { property: 'priority', direction: 'desc' },
  { property: 'updated', direction: 'asc' },
];

export const Default: Story = {
  args: {
    value: singleRule,
    onChange: () => {},
    fields,
  },
  render: () => {
    const [value, setValue] = useState<MtSortRule[]>(singleRule);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Single rule</div>
        <MtSortDropdown title="Sort" value={value} onChange={setValue} fields={fields} />
      </div>
    );
  },
};

export const IconTrigger: Story = {
  args: {
    value: singleRule,
    onChange: () => {},
    fields,
  },
  render: () => {
    const [value, setValue] = useState<MtSortRule[]>(singleRule);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Icon trigger</div>
        <MtSortDropdown
          title="Sort"
          value={value}
          onChange={setValue}
          fields={fields}
          kind="icon"
          variant="ghost"
          showCaret={false}
        />
      </div>
    );
  },
};

export const MultipleRules: Story = {
  args: {
    value: multiRule,
    onChange: () => {},
    fields,
  },
  render: () => {
    const [value, setValue] = useState<MtSortRule[]>(multiRule);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Multiple rules</div>
        <MtSortDropdown title="Sort" value={value} onChange={setValue} fields={fields} />
      </div>
    );
  },
};
