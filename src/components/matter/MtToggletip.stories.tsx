import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtToggletip } from './MtToggletip';
import { MtButton } from './MtButton';

const meta = {
  title: 'Information/Toggletip',
  component: MtToggletip,
  tags: ['autodocs'],
} satisfies Meta<typeof MtToggletip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <MtButton size="large" variant="accent">
        Toggle me
      </MtButton>
    ),
    content: <>Tooltip content</>,
    title: 'Toggletip Title',
    footer: 'Toggletip Footer',
    closeButton: true,
  },
};
