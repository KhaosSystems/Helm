import { DropdownMenu } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import { MtButton } from './MtButton';

type MtDropdownTriggerProps = {
  children: React.ReactElement;
};

function MtDropdownTrigger({ children }: MtDropdownTriggerProps) {
  return children;
}

export function MtDropdownItem({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Item>) {
  return (
    <DropdownMenu.Item
      className={`mt-surface-input-ghost data-highlighted:bg-surface-popover flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors data-disabled:cursor-not-allowed data-disabled:opacity-40 ${className || ''}`}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
}

/**
 * MtDropdown component
 *
 * Special features:
 *  - Shortcuts for each item. Press item index when opened to select it.
 */
interface MtDropdownProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  kind?: 'default' | 'icon';
  size?: 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'accent';
  showCaret?: boolean;
}

type MtDropdownComponent = ((props: MtDropdownProps) => React.ReactElement) & {
  Trigger: typeof MtDropdownTrigger;
};

const MtDropdownBase = ({
  title,
  children,
  className,
  kind = 'default',
  size = 'medium',
  variant = 'default',
  showCaret = true,
}: MtDropdownProps) => {
  const iconContentClass = size === 'large' ? '[&_svg]:h-5 [&_svg]:w-5' : '[&_svg]:h-4 [&_svg]:w-4';
  const iconSizeClass = size === 'large' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  let triggerOverride: React.ReactElement | null = null;
  const dropdownItems: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === MtDropdownTrigger) {
      triggerOverride = (child.props as MtDropdownTriggerProps).children;
      return;
    }
    dropdownItems.push(child);
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {triggerOverride || (
          <MtButton
            kind={kind}
            size={size}
            variant={variant}
            className={kind === 'icon' ? `${iconContentClass} ${className || ''}` : className}
          >
            <span className="leading-none inline-flex items-center justify-center">{title || 'Dropdown'}</span>
            {kind !== 'icon' && showCaret && (
              <span className="inline-flex items-center justify-center">
                <ChevronDown className={`${iconSizeClass} opacity-70`} aria-hidden="true" />
              </span>
            )}
          </MtButton>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          side="bottom"
          className="mt-surface-menu z-50 min-w-48 rounded-lg border p-1.5 shadow-2xl"
        >
          {dropdownItems}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const MtDropdown = MtDropdownBase as MtDropdownComponent;
MtDropdown.Trigger = MtDropdownTrigger;
