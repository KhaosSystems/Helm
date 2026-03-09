import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Popover } from 'radix-ui';

interface MtInlineToastProps {
  children: ReactElement;
  message?: ReactNode;
  durationMs?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
}

export function MtInlineToast({
  children,
  message = 'Copied',
  durationMs = 1400,
  side = 'top',
  align = 'center',
  disabled = false,
}: MtInlineToastProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (!closeTimerRef.current) {
      return;
    }

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const showToast = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, durationMs);
  }, [clearCloseTimer, durationMs]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled) {
        setOpen(false);
        return;
      }

      if (!nextOpen) {
        clearCloseTimer();
        setOpen(false);
        return;
      }

      showToast();
    },
    [clearCloseTimer, disabled, showToast],
  );

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          role="status"
          aria-live="polite"
          className="pointer-events-none rounded-md border border-border-default bg-surface-subtle px-2 py-1 text-xs text-text-primary shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-150 data-[state=open]:opacity-100 data-[state=open]:translate-y-0 data-[state=closed]:opacity-0 data-[state=closed]:translate-y-1"
        >
          {message}
          <Popover.Arrow className="fill-surface-subtle" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
