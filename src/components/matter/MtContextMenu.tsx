import { ContextMenu as RadixContextMenu } from 'radix-ui';
import { ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface MtContextMenuItem {
  label: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: React.ReactNode;
  items?: MtContextMenuItem[];
  separator?: boolean;
}

interface MtContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items?: MtContextMenuItem[];
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  focusOnOpen?: boolean;
  renderMenuItems?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  className?: string;
}

interface WithContextMenuProps {
  children: (props: { openMenu: React.MouseEventHandler<HTMLElement> }) => React.ReactElement;
  getContextMenuItems?: () => MtContextMenuItem[];
  renderMenuItems?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  focusOnOpen?: boolean;
}

function renderItems(items: MtContextMenuItem[]) {
  return items.map((item, index) => {
    if (item.separator) {
      return <RadixContextMenu.Separator key={`separator-${index}`} className="my-1 h-px bg-border-default" />;
    }0

    if (item.items?.length) {
      return (
        <RadixContextMenu.Sub key={`sub-${index}`}>
          <RadixContextMenu.SubTrigger
            disabled={item.disabled}
            className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-text-default outline-none transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-surface-hover"
          >
            <span>{item.label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </RadixContextMenu.SubTrigger>
          <RadixContextMenu.Portal>
            <RadixContextMenu.SubContent
              sideOffset={6}
              alignOffset={-4}
              className="z-50 min-w-44 rounded-lg border border-border-default bg-surface-base p-1.5 shadow-2xl"
            >
              {renderItems(item.items)}
            </RadixContextMenu.SubContent>
          </RadixContextMenu.Portal>
        </RadixContextMenu.Sub>
      );
    }

    return (
      <RadixContextMenu.Item
        key={`item-${index}`}
        disabled={item.disabled}
        onSelect={item.onSelect}
        className="flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-text-default outline-none transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-surface-hover"
      >
        <span>{item.label}</span>
        {item.shortcut ? <span className="ml-6 text-xs text-text-muted">{item.shortcut}</span> : null}
      </RadixContextMenu.Item>
    );
  });
}

export function MtContextMenu({
  open,
  x,
  y,
  items,
  onOpenChange,
  onClose,
  renderMenuItems,
  renderHeader,
  className,
}: MtContextMenuProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const didDispatchOpenRef = useRef(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
      if (!nextOpen) onClose?.();
    },
    [onClose, onOpenChange],
  );

  const content = useMemo(() => {
    if (renderMenuItems) return renderMenuItems();
    return renderItems(items ?? []);
  }, [items, renderMenuItems]);

  useEffect(() => {
    if (!open) {
      didDispatchOpenRef.current = false;
      return;
    }

    if (didDispatchOpenRef.current || !triggerRef.current) return;

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: x,
      clientY: y,
    });

    triggerRef.current.dispatchEvent(event);
    didDispatchOpenRef.current = true;
  }, [open, x, y]);

  if (!open) {
    return null;
  }

  return (
    <RadixContextMenu.Root onOpenChange={handleOpenChange}>
      <RadixContextMenu.Trigger asChild>
        <span ref={triggerRef} aria-hidden className="fixed h-0 w-0" style={{ left: x, top: y }} />
      </RadixContextMenu.Trigger>

      <RadixContextMenu.Portal>
        <RadixContextMenu.Content
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={`z-50 min-w-48 rounded-lg border border-border-default bg-surface-base p-1.5 shadow-2xl ${className ?? ''}`}
        >
          {renderHeader ? <div className="px-2.5 py-1.5 text-xs text-text-muted">{renderHeader()}</div> : null}
          {renderHeader ? <RadixContextMenu.Separator className="my-1 h-px bg-border-default" /> : null}
          {content}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
}

function getPointFromEvent(event: React.MouseEvent<HTMLElement>) {
  if (event.clientX || event.clientY) {
    return { x: event.clientX, y: event.clientY };
  }

  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function WithContextMenu({
  children,
  getContextMenuItems,
  renderMenuItems,
  renderHeader,
}: WithContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const openMenu = useCallback<React.MouseEventHandler<HTMLElement>>((event) => {
    event.preventDefault();
    setPoint(getPointFromEvent(event));
    setOpen(true);
  }, []);

  return (
    <>
      {children({ openMenu })}
      <MtContextMenu
        open={open}
        x={point.x}
        y={point.y}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
        items={getContextMenuItems?.()}
        renderMenuItems={renderMenuItems}
        renderHeader={renderHeader}
      />
    </>
  );
}
