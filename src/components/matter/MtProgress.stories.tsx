import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtProgress } from './MtProgress';

const meta = {
  title: 'Input/Progress',
  component: MtProgress,
} satisfies Meta<typeof MtProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 70,
  },
};
