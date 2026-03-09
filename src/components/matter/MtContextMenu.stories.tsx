import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';

import { MtButton } from './MtButton';
import { MtContextMenu, MtContextMenuItem, WithContextMenu } from './MtContextMenu';

const meta = {
  title: 'Input/ContextMenu',
  component: MtContextMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof MtContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

function demoItems(log: (label: string) => void): MtContextMenuItem[] {
  return [
    { label: 'Open', shortcut: '⌘O', onSelect: () => log('Open') },
    { label: 'Rename', shortcut: '⌘R', onSelect: () => log('Rename') },
    { separator: true, label: 'separator' },
    {
      label: 'Share',
      items: [
        { label: 'Copy Link', onSelect: () => log('Copy Link') },
        { label: 'Invite People', onSelect: () => log('Invite People') },
      ],
    },
    { label: 'Archive', disabled: true },
    { label: 'Delete', onSelect: () => log('Delete') },
  ];
}

export const Controlled: Story = {
  args: {
    open: false,
    x: 0,
    y: 0,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [point, setPoint] = useState({ x: 120, y: 120 });
    const [lastAction, setLastAction] = useState('None');
    const items = useMemo(() => demoItems(setLastAction), []);

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide">Controlled context menu</div>
        <div
          className="rounded-lg border p-10 text-sm"
          onContextMenu={(event) => {
            event.preventDefault();
            setPoint({ x: event.clientX, y: event.clientY });
            setOpen(true);
          }}
        >
          Right-click in this area to open the menu.
        </div>
        <div className="text-xs">Last action: {lastAction}</div>

        <MtContextMenu
          open={open}
          x={point.x}
          y={point.y}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
          items={items}
          renderHeader={() => <span>Project Actions</span>}
        />
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  args: {
    open: false,
    x: 0,
    y: 0,
  },
  render: () => {
    const [lastAction, setLastAction] = useState('None');

    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="text-xs uppercase tracking-wide">Uncontrolled with helper wrapper</div>
        <WithContextMenu
          getContextMenuItems={() => demoItems(setLastAction)}
          renderHeader={() => <span>Quick Actions</span>}
        >
          {({ openMenu }) => (
            <div className="flex items-center gap-3">
              <MtButton onClick={openMenu}>Open Menu</MtButton>
              <div
                className="rounded-md border px-3 py-2 text-xs"
                onContextMenu={openMenu}
              >
                Or right-click this chip
              </div>
            </div>
          )}
        </WithContextMenu>
        <div className="text-xs">Last action: {lastAction}</div>
      </div>
    );
  },
};
