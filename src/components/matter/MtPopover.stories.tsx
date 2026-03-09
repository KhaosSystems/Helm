import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtPopover } from './MtPopover';
import { MtButton } from './MtButton';

const meta = {
  title: 'Information/Popover',
  component: MtPopover,
  tags: ['autodocs'],
  args: {
    children: (
      <MtButton variant="default" size="medium">
        Open popover
      </MtButton>
    ),
    content: <div className="text-sm">Popover content</div>,
    side: 'bottom',
    align: 'start',
    sideOffset: 6,
  },
  argTypes: {
    side: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
    sideOffset: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
    },
  },
} satisfies Meta<typeof MtPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Positions: Story = {
  args: {
    children: <></>,
    content: <></>,
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8">
      <MtPopover side="top" align="center" content={<div className="text-sm">Top</div>}>
        <MtButton variant="default">Top</MtButton>
      </MtPopover>

      <MtPopover side="right" align="center" content={<div className="text-sm">Right</div>}>
        <MtButton variant="default">Right</MtButton>
      </MtPopover>

      <MtPopover side="bottom" align="center" content={<div className="text-sm">Bottom</div>}>
        <MtButton variant="default">Bottom</MtButton>
      </MtPopover>

      <MtPopover side="left" align="center" content={<div className="text-sm">Left</div>}>
        <MtButton variant="default">Left</MtButton>
      </MtPopover>
    </div>
  ),
};

export const CustomTrigger: Story = {
  args: {
    children: (
      <>
        <MtPopover.Trigger>
          <MtButton variant="ghost" size="large">
            Custom trigger
          </MtButton>
        </MtPopover.Trigger>
      </>
    ),
    content: <div className="text-sm">Using MtPopover.Trigger override</div>,
  },
};