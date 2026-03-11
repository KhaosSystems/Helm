import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { MtIconPreview, MtIconSelect } from './MtIconSelect';

const meta = {
  title: 'Input/Icon Select',
  component: MtIconSelect,
  tags: ['autodocs'],
} satisfies Meta<typeof MtIconSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function StatefulIconSelect({ initialValue = 'bug' }: { initialValue?: string }) {
  const [value, setValue] = React.useState<string | undefined>(initialValue);

  return (
    <div className="flex items-center gap-3 p-4">
      <MtIconSelect value={value} onChange={setValue} />
      <div className="flex items-center gap-2 rounded border border-border-default bg-surface-subtle px-3 py-2 text-sm text-text-primary">
        <MtIconPreview name={value} size={16} />
        <span>{value}</span>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <StatefulIconSelect />,
};

export const Empty: Story = {
  render: () => <StatefulIconSelect initialValue={undefined} />,
};
