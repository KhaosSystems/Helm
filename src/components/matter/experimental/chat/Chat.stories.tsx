import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtChat } from './Message';

const meta = {
  title: 'Experimental/Chat',
  component: MtChat,
  tags: ['autodocs'],
} satisfies Meta<typeof MtChat>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
