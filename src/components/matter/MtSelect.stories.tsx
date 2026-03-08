import type { Meta, StoryObj } from '@storybook/react-vite';
import { IceCream, Nut, Pizza } from 'lucide-react';
import { useState } from 'react';

import { MtSelect, MtSelectItem } from './MtSelect';

const meta = {
  title: 'Input/Select',
  tags: ['autodocs'],
  component: MtSelect,
} satisfies Meta<typeof MtSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

const statusOptions = (
  <>
    <MtSelectItem value="todo">Todo</MtSelectItem>
    <MtSelectItem value="in-progress">In Progress</MtSelectItem>
    <MtSelectItem value="done">Done</MtSelectItem>
  </>
);

const iconOptions = (
  <>
    <MtSelectItem key="alpha" value="a" icon={<Nut />}>
      Alpha
    </MtSelectItem>
    <MtSelectItem key="beta" value="b" icon={<IceCream />}>
      Beta
    </MtSelectItem>
    <MtSelectItem key="gamma" value="c" icon={<Pizza />}>
      Gamma
    </MtSelectItem>
  </>
);

export const Default: Story = {
  args: {
    placeholder: 'Select a status',
    children: statusOptions,
    value: 'todo',
  },
};

export const Sizes: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex gap-6 p-4">
      <div className="flex w-56 flex-col gap-2">
        <small>medium (default)</small>
        <MtSelect placeholder="Select a status">{statusOptions}</MtSelect>
      </div>
      <div className="flex w-56 flex-col gap-2">
        <small>large</small>
        <MtSelect size="large" placeholder="Select a status">
          {statusOptions}
        </MtSelect>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  args: {
    children: <></>,
  },
  render: () => (
    <div className="flex gap-6 p-4">
      <div className="flex w-56 flex-col gap-2">
        <small>default</small>
        <MtSelect placeholder="Select a status">{statusOptions}</MtSelect>
      </div>
      <div className="flex w-56 flex-col gap-2">
        <small>ghost</small>
        <MtSelect variant="ghost" placeholder="Select a status">
          {statusOptions}
        </MtSelect>
      </div>
    </div>
  ),
};

export const IconKind: Story = {
  args: {
    children: <></>,
    value: 'b',
  },
  render: (args) => {
    const [value, setValue] = useState((args.value as string) ?? 'b');

    return (
      <div className="flex flex-wrap items-start gap-6 p-4">
        <div className="flex flex-col gap-2">
          <small>icon kind</small>
          <MtSelect {...args} value={value} onValueChange={setValue} placeholder="?" kind="icon" variant="ghost">
            {iconOptions}
          </MtSelect>
        </div>

        <div className="flex flex-col gap-2">
          <small>icon kind with default variant</small>
          <MtSelect {...args} value={value} onValueChange={setValue} placeholder="?" kind="icon" variant="default">
            {iconOptions}
          </MtSelect>
        </div>

        <div className="flex flex-col gap-2">
          <small>large icon kind</small>
          <MtSelect {...args} value={value} onValueChange={setValue} size="large" placeholder="?" kind="icon">
            {iconOptions}
          </MtSelect>
        </div>
      </div>
    );
  },
};

export const DataDriven: Story = {
  args: {
    options: [
      { value: 'todo', label: 'Todo', icon: <Nut /> },
      { value: 'in-progress', label: 'In Progress', icon: <IceCream /> },
      { value: 'done', label: 'Done', icon: <Pizza /> },
    ],
  },
  render: (args) => (
    <div className="p-4">
      <MtSelect kind="icon" {...args} />
      <MtSelect {...args} />
    </div>
  ),
};
