import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtDivider } from './MtDivider';

const meta = {
  title: 'Display/Divider',
  component: MtDivider,
  tags: ['autodocs'],
  args: {
    title: undefined,
    className: '',
  },
} satisfies Meta<typeof MtDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Titled: Story = {
  args: {
    title: 'Section Title',
  },
};
