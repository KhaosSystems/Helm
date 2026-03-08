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
          className="z-50 w-[320px] rounded-xl border border-neutral-700/70 bg-neutral-900/95 p-3 text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="flex items-start justify-between gap-3">
            {title ? <div className="text-sm font-semibold leading-5">{title}</div> : <div />}
            {closeButton && (
              <button
                type="button"
                aria-label="Close toggletip"
                onClick={() => setOpen(false)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-700/60 bg-neutral-800/70 text-neutral-300 transition-colors hover:bg-neutral-700/80 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-2 text-sm text-neutral-200">{content}</div>

          {footer && <div className="mt-3 border-t border-neutral-700/50 pt-2">{footer}</div>}

          <Popover.Arrow className="fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
