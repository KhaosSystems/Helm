import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtTooltip } from './MtTooltip';
import { MtButton } from './MtButton';

const meta = {
  title: 'Information/Tooltip',
  component: MtTooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof MtTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <MtButton size="large" variant="accent">
        Hover me
      </MtButton>
    ),
    content: <>Tooltip content</>,
    variant: 'info',
    side: 'top',
    align: 'start',
  },
};
