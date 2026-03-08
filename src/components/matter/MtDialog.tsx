import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

interface MtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

export function MtDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = '900px',
  showCloseButton = true,
  className,
  contentClassName,
}: MtDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]" />
        <Dialog.Content
          style={{ maxWidth }}
          className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-neutral-700/70 bg-neutral-900/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] focus:outline-none ${className || ''} ${contentClassName || ''}`}
        >
          {(title || description || showCloseButton) && (
            <div className="mb-5 border-b border-neutral-700/50 pb-4 pr-10">
              {title && (
                <Dialog.Title className="text-xl font-semibold flex items-center gap-2 before:content-none! text-neutral-100">
                  {title}
                </Dialog.Title>
              )}

              {description && (
                <Dialog.Description className="mt-2 text-sm text-neutral-400">{description}</Dialog.Description>
              )}
            </div>
          )}

          {showCloseButton && (
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700/60 bg-neutral-800/70 text-neutral-400 transition-colors hover:text-neutral-100 hover:bg-neutral-700/80"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const MtDialogClose = Dialog.Close;
