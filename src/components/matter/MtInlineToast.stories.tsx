import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtButton } from './MtButton';
import { MtInlineToast } from './MtInlineToast';

const meta = {
  title: 'Information/InlineToast',
  component: MtInlineToast,
  tags: ['autodocs'],
} satisfies Meta<typeof MtInlineToast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Copied',
    durationMs: 1400,
    side: 'top',
    align: 'center',
    children: <MtButton variant="default">Copy link</MtButton>,
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Saved',
    durationMs: 1800,
    side: 'right',
    align: 'center',
    children: <MtButton variant="accent">Save settings</MtButton>,
  },
};
