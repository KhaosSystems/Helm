import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, CircleDot, Paperclip, User } from 'lucide-react';
import { useState } from 'react';

import { MtFilterDropdown, type MtFilterGroup } from './MtFilter';

const meta = {
  title: 'Input/Filter',
  component: MtFilterDropdown,
  tags: ['autodocs'],
} satisfies Meta<typeof MtFilterDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

const fields = [
  { value: 'attach_file', label: 'Attach file', icon: <Paperclip className="h-4 w-4" /> },
  { value: 'status', label: 'Status', icon: <CircleDot className="h-4 w-4" /> },
  { value: 'assignee', label: 'Assignee', icon: <User className="h-4 w-4" /> },
  { value: 'priority', label: 'Priority', icon: <AlertTriangle className="h-4 w-4" /> },
];

const operators = [
  { value: 'is', label: 'is', requiresValue: true },
  { value: 'is_not', label: 'is not', requiresValue: true },
  { value: 'contains', label: 'contains', requiresValue: true },
  { value: 'is_empty', label: 'is empty', requiresValue: false },
  { value: 'is_not_empty', label: 'is not empty', requiresValue: false },
];

const simpleFilter: MtFilterGroup = {
  type: 'group',
  conjunction: 'AND',
  children: [
    {
      type: 'rule',
      field: 'attach_file',
      operator: 'is_not_empty',
      value: null,
    },
  ],
};

const advancedFilter: MtFilterGroup = {
  type: 'group',
  conjunction: 'AND',
  children: [
    {
      type: 'rule',
      field: 'status',
      operator: 'is',
      value: 'in progress',
    },
    {
      type: 'group',
      conjunction: 'OR',
      children: [
        {
          type: 'rule',
          field: 'priority',
          operator: 'is',
          value: 'high',
        },
        {
          type: 'rule',
          field: 'attach_file',
          operator: 'is_not_empty',
          value: null,
        },
      ],
    },
  ],
};

export const Default: Story = {
  args: {
    value: simpleFilter,
    onChange: () => {},
    fields,
    operators,
  },
  render: () => {
    const [value, setValue] = useState<MtFilterGroup>(simpleFilter);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Simple</div>
        <MtFilterDropdown title="Filter" value={value} onChange={setValue} fields={fields} operators={operators} />
      </div>
    );
  },
};

export const IconTrigger: Story = {
  args: {
    value: simpleFilter,
    onChange: () => {},
    fields,
    operators,
  },
  render: () => {
    const [value, setValue] = useState<MtFilterGroup>(simpleFilter);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Icon trigger</div>
        <MtFilterDropdown
          title="Filter"
          value={value}
          onChange={setValue}
          fields={fields}
          operators={operators}
          kind="icon"
          variant="ghost"
          showCaret={false}
        />
      </div>
    );
  },
};

export const Advanced: Story = {
  args: {
    value: advancedFilter,
    onChange: () => {},
    fields,
    operators,
  },
  render: () => {
    const [value, setValue] = useState<MtFilterGroup>(advancedFilter);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Advanced</div>
        <MtFilterDropdown
          title="Advanced"
          value={value}
          onChange={setValue}
          fields={fields}
          operators={operators}
          advanced
        />
      </div>
    );
  },
};
