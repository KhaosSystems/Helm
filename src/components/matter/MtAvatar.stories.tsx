import type { Meta, StoryObj } from '@storybook/react-vite';

import MtAvatar from './MtAvatar';

const meta = {
  title: 'Data Display/Avatar',
  tags: ['autodocs'],
  component: MtAvatar,
} satisfies Meta<typeof MtAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Jane Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/80?img=31',
    alt: 'Jane Doe',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <MtAvatar size="xs" name="Alex" />
      <MtAvatar size="sm" name="Alex" />
      <MtAvatar size="md" name="Alex" />
      <MtAvatar size="lg" name="Alex" />
    </div>
  ),
};
