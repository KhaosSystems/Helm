import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { MtButton } from './MtButton';
import { MtDialog, MtDialogClose } from './MtDialog';
import { MtInput } from './MtInput';

const meta = {
  title: 'Feedback/Dialog',
  component: MtDialog,
  tags: ['autodocs'],
  args: {
    open: false,
    title: <span>Dialog</span>,
    onOpenChange: fn(),
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-4">
        <MtButton onClick={() => setOpen(true)}>Open Dialog</MtButton>

        <MtDialog
          {...args}
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            args.onOpenChange(open);
          }}
        >
          {args.children}
        </MtDialog>
      </div>
    );
  },
} satisfies Meta<typeof MtDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="text-sm">Dialog content goes here</div>,
  },
};

export const EditProfile: Story = {
  args: {
    open: false,
    title: <span>Edit profile</span>,
    children: <div />,
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-4">
        <MtButton onClick={() => setOpen(true)}>Open Dialog</MtButton>

        <MtDialog open={open} onOpenChange={setOpen} title={<span>Edit profile</span>} maxWidth="520px">
          <div className="flex flex-col gap-3">
            <MtInput placeholder="Name" defaultValue="Pedro Duarte" className="w-full" />
            <MtInput placeholder="Username" defaultValue="@peduarte" className="w-full" />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <MtDialogClose asChild>
              <button type="button" className="mt-layout-input-medium mt-surface-input-ghost rounded border px-3">
                Cancel
              </button>
            </MtDialogClose>
            <MtDialogClose asChild>
              <button type="button" className="mt-layout-input-medium mt-surface-input-accent rounded border px-3">
                Save changes
              </button>
            </MtDialogClose>
          </div>
        </MtDialog>
      </div>
    );
  },
};
