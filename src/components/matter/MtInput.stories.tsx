import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtInput } from './MtInput';

const meta = {
  title: 'Input/Input',
  tags: ['autodocs'],
  component: MtInput,
  args: {
    placeholder: 'Placeholder...',
  },
} satisfies Meta<typeof MtInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MtInput placeholder="Medium size" size="medium" />
      <MtInput placeholder="Large size" size="large" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MtInput placeholder="Default variant" variant="default" />
      <MtInput placeholder="Ghost variant" variant="ghost" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MtInput placeholder="Disabled medium" size="medium" disabled />
      <MtInput placeholder="Disabled large" size="large" disabled />
    </div>
  ),
};
