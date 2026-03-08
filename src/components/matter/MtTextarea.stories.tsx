import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtTextarea } from './MtTextarea';

const meta = {
  title: 'Input/Textarea',
  component: MtTextarea,
} satisfies Meta<typeof MtTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
