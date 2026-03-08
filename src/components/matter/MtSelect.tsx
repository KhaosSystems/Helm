import { Check, ChevronDown } from 'lucide-react';
import { Select } from 'radix-ui';
import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { MtButton } from './MtButton';

type MtSelectTriggerProps = {
  children: React.ReactElement;
};

type MtSelectParts = {
  triggerOverride: React.ReactElement | null;
  selectItems: React.ReactElement[];
};

function MtSelectTrigger({ children }: MtSelectTriggerProps) {
  return children;
}

function collectSelectParts(children: React.ReactNode, parts: MtSelectParts) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === MtSelectTrigger) {
      parts.triggerOverride = (child.props as MtSelectTriggerProps).children;
      return;
    }

    if (child.type === React.Fragment) {
      collectSelectParts((child.props as { children?: React.ReactNode }).children, parts);
      return;
    }

    parts.selectItems.push(child);
  });
}

export const MtSelectItem = React.forwardRef<
  React.ElementRef<typeof Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Item> & {
    icon?: React.ReactNode;
    shortcut?: string;
  }
>(({ children, className, icon, shortcut = '', ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={`flex min-w-44 cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-sm text-neutral-100 outline-none transition-colors data-[state=checked]:bg-neutral-700/60 data-disabled:cursor-not-allowed data-disabled:opacity-40 data-highlighted:bg-neutral-700/60 ${className}`}
      {...props}
      ref={forwardedRef}
    >
      <span className="flex items-center">
        {icon ? <span className="mr-2">{icon}</span> : null}
        <Select.ItemText>{children}</Select.ItemText>
      </span>
      <span className="ml-6 flex items-center gap-2 text-xs text-neutral-500">
        {shortcut ? <span>{shortcut}</span> : null}
        <Select.ItemIndicator>
          <Check className="h-4 w-4 text-neutral-500" />
        </Select.ItemIndicator>
      </span>
    </Select.Item>
  );
});

interface MtSelectProps {
  children?: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
  kind?: 'default' | 'icon';
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'medium' | 'large';
  options?: { value: string; label: React.ReactNode; icon?: React.ReactNode; disabled?: boolean }[];
  variant?: 'default' | 'ghost';
  showCaret?: boolean;
}

type MtSelectComponent = ((props: MtSelectProps) => React.ReactElement) & {
  Trigger: typeof MtSelectTrigger;
};

/**
 * MtSelect component
 *
 * TODO: TODO: make the padding better, make the text left-aligned and the cheveron use padding, not absolute pos.
 *
 * Special features:
 *  - Shortcuts for each item. Press item index when opened to select it.
 */
const MtSelectBase = ({
  children,
  className,
  placeholder,
  kind = 'default',
  size = 'medium',
  options,
  variant = 'default',
  value: propValue,
  onValueChange,
  showCaret = true,
  ...props
}: MtSelectProps) => {
  const isControlled = propValue !== undefined && onValueChange !== undefined;
  const [internalValue, setInternalValue] = useState(propValue ?? '');
  const value = isControlled ? propValue : internalValue;
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const iconContentClass = size === 'large' ? '[&_svg]:h-5 [&_svg]:w-5' : '[&_svg]:h-4 [&_svg]:w-4';
  const iconSizeClass = size === 'large' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  const { triggerOverride, selectItems } = React.useMemo(() => {
    const parts: MtSelectParts = { triggerOverride: null, selectItems: [] };

    // Composable mode
    if (children) {
      collectSelectParts(children, parts);
    }

    // Data-driven mode (only if no children)
    if (!children && options) {
      parts.selectItems = options.map((option) => (
        <MtSelectItem key={option.value} value={option.value} icon={option.icon} disabled={option.disabled}>
          {option.label}
        </MtSelectItem>
      ));
    }

    return parts;
  }, [children, options]);

  const selectedItem = selectItems.find(
    (child) => React.isValidElement(child) && (child.props as { value?: string }).value === value,
  ) as React.ReactElement<{ icon?: React.ReactNode }> | undefined;

  React.useEffect(() => {
    if (!isControlled && propValue !== undefined && propValue !== internalValue) {
      setInternalValue(propValue);
    }
  }, [isControlled, propValue, internalValue]);

  // Hotkeys
  useHotkeys(
    '1,2,3,4,5,6,7,8,9',
    (event: any) => {
      const index = Number(event.key) - 1;
      const item = selectItems[index] as React.ReactElement<{ value: string }>;
      if (!item) return;

      if (!isControlled) {
        setInternalValue(item.props.value);
      }
      onValueChange?.(item.props.value); // notify parent
      setOpen(false);
    },
    {
      enabled: open || hovered,
      enableOnFormTags: true,
      document: window.document,
    },
  );

  return (
    <Select.Root
      value={value}
      onValueChange={(v) => {
        if (!isControlled) {
          setInternalValue(v);
        }
        onValueChange?.(v);
      }}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <Select.Trigger asChild onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {triggerOverride || (
          <MtButton
            kind={kind}
            size={size}
            variant={variant}
            className={kind === 'icon' ? `${iconContentClass} ${className || ''}` : className}
          >
            <span className="leading-none inline-flex items-center justify-center">
              {kind === 'icon' ? (
                <span
                  className={`inline-flex h-full w-full items-center justify-center leading-none ${iconContentClass}`}
                >
                  {selectedItem?.props.icon ?? placeholder}
                </span>
              ) : (
                <Select.Value placeholder={placeholder} />
              )}
            </span>

            {kind !== 'icon' && showCaret && (
              <span className="inline-flex items-center justify-center">
                <ChevronDown className={`${iconSizeClass} opacity-70`} aria-hidden="true" />
              </span>
            )}
          </MtButton>
        )}
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          sideOffset={5}
          position="popper"
          align="center"
          className="z-50 min-w-48 rounded-lg border border-neutral-700/60 bg-neutral-900/95 p-1.5 shadow-2xl"
        >
          <Select.ScrollUpButton />
          <Select.Viewport>
            <Select.Group>
              {selectItems.map((child, index) =>
                React.cloneElement(child as React.ReactElement<any>, {
                  shortcut: (index + 1).toString(),
                }),
              )}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export const MtSelect = MtSelectBase as MtSelectComponent;
MtSelect.Trigger = MtSelectTrigger;
