import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { ChevronRight } from 'lucide-react';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface MtMenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: React.ReactNode;
  items?: MtMenuItem[];
  separator?: boolean;
  tone?: 'default' | 'destructive';
  className?: string;
}

interface MtMenuProps {
  open: boolean;
  x: number;
  y: number;
  children?: React.ReactNode;
  items?: MtMenuItem[];
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  renderMenuItems?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  className?: string;
}

interface WithMenuProps {
  children: (props: { openMenu: React.MouseEventHandler<HTMLElement> }) => React.ReactElement;
  getMenuItems?: () => MtMenuItem[];
  getContextMenuItems?: () => MtMenuItem[];
  renderMenuItems?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
}

interface MtMenuItemProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: React.ReactNode;
  tone?: 'default' | 'destructive';
  className?: string;
}

interface MtMenuSubmenuProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  shortcut?: React.ReactNode;
  tone?: 'default' | 'destructive';
  className?: string;
}

interface MtMenuSeparatorProps {
  className?: string;
}

interface MtMenuComponent extends React.FC<MtMenuProps> {
  Item: React.FC<MtMenuItemProps>;
  Submenu: React.FC<MtMenuSubmenuProps>;
  Separator: React.FC<MtMenuSeparatorProps>;
}



interface MenuRuntimeContextValue {
  closeMenu: () => void;
}

const MenuRuntimeContext = createContext<MenuRuntimeContextValue | null>(null);

const menuItemClassName = 'flex min-w-44 items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm text-text-default outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40';

const destructiveMenuItemClassName = 'text-red-400 hover:bg-red-500/10 focus-visible:bg-red-500/10';

const menuSurfaceClassName = 'mt-surface-menu z-50 min-w-48 rounded-lg p-1.5 shadow-2xl';


function MtMenuItemNode(_props: MtMenuItemProps) {
  return null;
}

function MtMenuSubmenuNode(_props: MtMenuSubmenuProps) {
  return null;
}

function MtMenuSeparatorNode(_props: MtMenuSeparatorProps) {
  return null;
}

function useMenuRuntimeContext() {
  const context = useContext(MenuRuntimeContext);
  return context ?? { closeMenu: () => undefined };
}

function MenuItemButton({
  children,
  icon,
  onSelect,
  disabled,
  shortcut,
  tone,
  className,
}: MtMenuItemProps) {
  const { closeMenu } = useMenuRuntimeContext();

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        closeMenu();
      }}
      className={`${menuItemClassName} ${tone === 'destructive' ? destructiveMenuItemClassName : ''} ${className ?? ''}`}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{children}</span>
      </span>
      {shortcut ? <span className="ml-6 text-xs text-text-muted">{shortcut}</span> : null}
    </button>
  );
}

function MenuSubmenu({ children, label, icon, disabled, shortcut, tone, className }: MtMenuSubmenuProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'right-start',
    middleware: [offset({ mainAxis: 6, crossAxis: -4 }), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: !disabled,
    move: false,
    handleClose: safePolygon(),
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        className={`${menuItemClassName} ${tone === 'destructive' ? destructiveMenuItemClassName : ''} ${className ?? ''}`}
        {...getReferenceProps({
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            if (!disabled) setOpen((current) => !current);
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled) return;

            if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen(true);
            }

            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              setOpen(false);
            }
          },
        })}
      >
        <span className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </span>
        <span className="ml-3 flex items-center gap-2">
          {shortcut ? <span className="text-xs text-text-muted">{shortcut}</span> : null}
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        </span>
      </button>

      {open && !disabled ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={menuSurfaceClassName}
            {...getFloatingProps({ role: 'menu' })}
          >
            {children}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}

function renderMenuItemsFromItems(items: MtMenuItem[]): React.ReactNode {
  return items.map((item, index) => {
    if (item.separator) {
      return <div key={`separator-${index}`} role="separator" className="my-1 h-px bg-border-default" />;
    }

    if (item.items?.length) {
      return (
        <MenuSubmenu
          key={`submenu-${index}`}
          label={item.label}
          icon={item.icon}
          disabled={item.disabled}
          shortcut={item.shortcut}
          tone={item.tone}
          className={item.className}
        >
          {renderMenuItemsFromItems(item.items)}
        </MenuSubmenu>
      );
    }

    return (
      <MenuItemButton
        key={`item-${index}`}
        onSelect={item.onSelect}
        disabled={item.disabled}
        icon={item.icon}
        shortcut={item.shortcut}
        tone={item.tone}
        className={item.className}
      >
        {item.label}
      </MenuItemButton>
    );
  });
}

function renderDeclarativeChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    if (child.type === MtMenuItemNode) {
      const props = child.props as MtMenuItemProps;
      return (
        <MenuItemButton
          key={`menu-item-${index}`}
          onSelect={props.onSelect}
          disabled={props.disabled}
          icon={props.icon}
          shortcut={props.shortcut}
          tone={props.tone}
          className={props.className}
        >
          {props.children ?? props.label}
        </MenuItemButton>
      );
    }

    if (child.type === MtMenuSeparatorNode) {
      const props = child.props as MtMenuSeparatorProps;
      return <div key={`menu-separator-${index}`} role="separator" className={`my-1 h-px bg-border-default ${props.className ?? ''}`} />;
    }

    if (child.type === MtMenuSubmenuNode) {
      const props = child.props as MtMenuSubmenuProps;
      return (
        <MenuSubmenu
          key={`menu-submenu-${index}`}
          label={props.label}
          icon={props.icon}
          disabled={props.disabled}
          shortcut={props.shortcut}
          tone={props.tone}
          className={props.className}
        >
          {renderDeclarativeChildren(props.children)}
        </MenuSubmenu>
      );
    }

    const nestedChildren = (child.props as { children?: React.ReactNode }).children;
    if (!nestedChildren) {
      return child;
    }

    return React.cloneElement(child, undefined, renderDeclarativeChildren(nestedChildren));
  });
}

function MtMenuBase({
  open,
  x,
  y,
  children,
  items,
  onOpenChange,
  onClose,
  renderMenuItems,
  renderHeader,
  className,
}: MtMenuProps) {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
      if (!nextOpen) onClose?.();
    },
    [onClose, onOpenChange],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true });
  const role = useRole(context, { role: 'menu' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const content = useMemo(() => {
    if (children) return renderDeclarativeChildren(children);
    if (renderMenuItems) return renderMenuItems();
    return renderMenuItemsFromItems(items ?? []);
  }, [children, items, renderMenuItems]);

  const closeMenu = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <MenuRuntimeContext.Provider value={{ closeMenu }}>
      <span ref={refs.setReference} aria-hidden className="fixed h-0 w-0" style={{ left: x, top: y }} />
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={`${menuSurfaceClassName} ${className ?? ''}`}
          {...getFloatingProps({ role: 'menu' })}
        >
          {renderHeader ? <div className="px-2.5 py-1.5 text-xs text-text-muted">{renderHeader()}</div> : null}
          {renderHeader ? <div role="separator" className="my-1 h-px bg-border-default" /> : null}
          {content}
        </div>
      </FloatingPortal>
    </MenuRuntimeContext.Provider>
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

export function WithMenu({ children, getMenuItems, getContextMenuItems, renderMenuItems, renderHeader }: WithMenuProps) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });

  const openMenu = useCallback<React.MouseEventHandler<HTMLElement>>((event) => {
    event.preventDefault();
    setPoint(getPointFromEvent(event));
    setOpen(true);
  }, []);

  const resolvedItems = getMenuItems?.() ?? getContextMenuItems?.();

  return (
    <>
      {children({ openMenu })}
      <MtMenu
        open={open}
        x={point.x}
        y={point.y}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
        items={resolvedItems}
        renderMenuItems={renderMenuItems}
        renderHeader={renderHeader}
      />
    </>
  );
}


export const MtMenu = Object.assign(MtMenuBase, {
  Item: MtMenuItemNode,
  Submenu: MtMenuSubmenuNode,
  Separator: MtMenuSeparatorNode,
}) as MtMenuComponent;

export const MtContextMenu = MtMenu;
export const WithContextMenu = WithMenu;
export type MtContextMenuItem = MtMenuItem;
