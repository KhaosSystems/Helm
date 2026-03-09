import { useState } from 'react';
import { Popover } from 'radix-ui';
import { X } from 'lucide-react';

interface MtToggletipProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function MtToggletip({
  children,
  title,
  content,
  footer,
  closeButton = true,
  side = 'top',
  align = 'center',
}: MtToggletipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          className="z-50 w-[320px] rounded-xl border border-border-default bg-surface-subtle p-3 text-text-default shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start justify-between gap-3">
            {title ? <div className="text-sm font-semibold leading-5">{title}</div> : <div />}
            {closeButton && (
              <button
                type="button"
                aria-label="Close toggletip"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-subtle text-text-muted transition-colors hover:bg-surface-default hover:text-text-default"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-2 text-sm text-text-muted">{content}</div>

          {footer && <div className="mt-3 border-t border-border-default pt-2">{footer}</div>}

          <Popover.Arrow className="fill-border-default" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
