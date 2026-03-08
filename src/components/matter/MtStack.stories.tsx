import type { Meta, StoryObj } from '@storybook/react-vite';

import MtStack from './MtStack';

const meta = {
  title: 'Layout/Stack',
  tags: ['autodocs'],
  component: MtStack,
} satisfies Meta<typeof MtStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    row: false,
    children: (
      <>
        <div className="bg-blue-500 text-white p-2 rounded">Item 1</div>
        <div className="bg-green-500 text-white p-2 rounded">Item 2</div>
        <div className="bg-red-500 text-white p-2 rounded">Item 3</div>
      </>
    ),
  },
};

export const Row: Story = {
  args: {
    row: true,
    children: (
      <>
        <div className="bg-blue-500 text-white p-2 rounded">Item 1</div>
        <div className="bg-green-500 text-white p-2 rounded">Item 2</div>
        <div className="bg-red-500 text-white p-2 rounded">Item 3</div>
      </>
    ),
  },
};
