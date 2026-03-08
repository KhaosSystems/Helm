import { expect, fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Nut } from 'lucide-react';

import { MtButton } from './MtButton';
import { axis } from './storybook/axis';
import { StoryMatrix } from './storybook/StoryMatrix';

const meta = {
  title: 'Input/Button',
  component: MtButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof MtButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <span>Default Button</span> },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).not.toBeDisabled();
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { children: <span>Disabled Button</span>, disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Matrix: Story = {
  args: { children: <span>Button</span> },
  render: () => (
    <StoryMatrix
      rows={axis('Variant', 'default', 'accent', 'ghost')}
      columns={axis('State', 'enabled', 'disabled')}
      sections={axis('Kind', 'default', 'icon')}
      groups={axis('Size', 'medium', 'large')}
      renderCell={(variant, state, kind, size) => (
        <MtButton
          variant={variant}
          kind={kind}
          size={size ?? 'medium'}
          disabled={state === 'disabled'}
          aria-label={kind === 'icon' ? `${variant} ${state} ${size} icon` : undefined}
        >
          {kind === 'icon' ? <Nut className="h-4 w-4" /> : <span>Button</span>}
        </MtButton>
      )}
    />
  ),
};
