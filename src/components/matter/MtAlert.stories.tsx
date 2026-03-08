import type { Meta, StoryObj } from '@storybook/react-vite';

import { MtAlert } from './MtAlert';
import { MtButton } from './MtButton';

const meta = {
  title: 'Information/Alert',
  component: MtAlert,
  tags: ['autodocs'],
} satisfies Meta<typeof MtAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    severity: 'info',
    title: 'Update available',
    content: 'A new version is ready to install.',
    actions: <MtButton variant="accent">Fix now</MtButton>,
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    title: 'Saved successfully',
    content: 'Your settings were updated.',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    title: 'Storage almost full',
    content: 'You are close to your project quota.',
    actions: <MtButton variant="default">Review usage</MtButton>,
  },
};

export const Error: Story = {
  args: {
    severity: 'error',
    title: 'Sync failed',
    content: 'We could not sync your latest changes.',
    actions: <MtButton variant="accent">Retry</MtButton>,
  },
};
