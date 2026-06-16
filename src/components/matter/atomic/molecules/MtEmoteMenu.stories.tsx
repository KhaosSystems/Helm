import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MtEmoteMenu } from './MtEmoteMenu';

const meta = {
  title: 'Molecules/Emote Menu',
  component: MtEmoteMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof MtEmoteMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('None');

    return (
      <div className="flex flex-col gap-3 p-6">
        <div className="text-xs uppercase tracking-wide text-text-muted">Emote menu molecule</div>
        <div className="w-fit rounded-lg border border-border-default bg-surface-elevated p-2">
          <MtEmoteMenu
            onItemSelect={(item) => {
              const label = typeof item.label === 'string' ? item.label : String(item.emoji);
              setLastAction(`Selected ${label}`);
            }}
          />
        </div>
        <div className="text-xs text-text-muted">Last action: {lastAction}</div>
      </div>
    );
  },
};

export const CustomItems: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState('None');

    return (
      <div className="flex flex-col gap-3 p-6">
        <div className="w-fit rounded-lg border border-border-default bg-surface-elevated p-2">
          <MtEmoteMenu
            items={[
              { emoji: '😀', label: 'Smile' },
              { emoji: '😅', label: 'Sweat smile' },
              { emoji: '🤔', label: 'Thinking' },
              { emoji: '🙏', label: 'Thanks' },
              { emoji: '🎉', label: 'Celebrate' },
              { emoji: '👋', label: 'Wave' },
              { emoji: '🫡', label: 'Salute' },
              { emoji: '🚫', label: 'Blocked', disabled: true },
            ]}
            onItemSelect={(item) => {
              const label = typeof item.label === 'string' ? item.label : String(item.emoji);
              setLastAction(`Selected ${label}`);
            }}
          />
        </div>
        <div className="text-xs text-text-muted">Last action: {lastAction}</div>
      </div>
    );
  },
};
