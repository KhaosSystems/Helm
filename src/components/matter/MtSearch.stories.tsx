import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtSearch } from './MtSearch';

const meta = {
  title: 'Input/Search',
  tags: ['autodocs'],
  component: MtSearch,
} satisfies Meta<typeof MtSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MtSearch placeholder="Default Search" />
      <MtSearch placeholder="Ghost Search" variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MtSearch placeholder="Medium Search" size="medium" />
      <MtSearch placeholder="Large Search" size="large" />
    </div>
  ),
};
