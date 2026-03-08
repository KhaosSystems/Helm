import type { Meta, StoryObj } from '@storybook/react-vite';

import MtAvatar from './MtAvatar';
import MtAvatarGroup from './MtAvatarGroup';

const meta = {
  title: 'Data Display/Avatar Group',
  tags: ['autodocs'],
  component: MtAvatarGroup,
} satisfies Meta<typeof MtAvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleAvatars = [
  { name: 'Jane Doe', src: 'https://i.pravatar.cc/80?img=31' },
  { name: 'Kai Storm', src: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Nina Rivers', src: 'https://i.pravatar.cc/80?img=47' },
  { name: 'Axel Quinn', src: 'https://i.pravatar.cc/80?img=4' },
  { name: 'Mina Cruz', src: 'https://i.pravatar.cc/80?img=8' },
];

export const Default: Story = {
  args: {
    avatars: sampleAvatars,
  },
};

export const WithMaxSurplus: Story = {
  args: {
    avatars: sampleAvatars,
    max: 3,
  },
};

export const AdjustableSpacing: Story = {
  args: {
    avatars: sampleAvatars,
    max: 4,
    spacing: 4,
  },
};

export const UsingChildren: Story = {
  render: () => (
    <MtAvatarGroup max={3}>
      <MtAvatar name="Jane Doe" src="https://i.pravatar.cc/80?img=31" />
      <MtAvatar name="Kai Storm" src="https://i.pravatar.cc/80?img=12" />
      <MtAvatar name="Nina Rivers" src="https://i.pravatar.cc/80?img=47" />
      <MtAvatar name="Axel Quinn" src="https://i.pravatar.cc/80?img=4" />
    </MtAvatarGroup>
  ),
};
