import React from 'react';
import { Popover } from 'radix-ui';

type MtPopoverTriggerProps = {
  children: React.ReactElement;
};

function MtPopoverTrigger({ children }: MtPopoverTriggerProps) {
  return children;
}

type MtPopoverProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
};

type MtPopoverComponent = ((props: MtPopoverProps) => React.ReactElement) & {
  Trigger: typeof MtPopoverTrigger;
};

const MtPopoverBase = ({
  children,
  content,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  className,
}: MtPopoverProps) => {
  let triggerOverride: React.ReactElement | null = null;
  const popoverChildren: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === MtPopoverTrigger) {
      triggerOverride = (child.props as MtPopoverTriggerProps).children;
      return;
    }

    popoverChildren.push(child);
  });

  const triggerElement = triggerOverride ?? (React.isValidElement(popoverChildren[0]) ? popoverChildren[0] : null);

  if (!triggerElement) {
    return <></>;
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{triggerElement}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={`bg-neutral-950/90 border border-neutral-700/50 rounded-lg p-2 shadow-2xl backdrop-blur-md z-50 ${className || ''}`}
        >
          {content}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const MtPopover = MtPopoverBase as MtPopoverComponent;
MtPopover.Trigger = MtPopoverTrigger;
