import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { MtButton } from './MtButton';

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
          className={`mt-surface-dialog fixed left-1/2 top-1/2 z-50 w-[92vw] max-h-[86vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] focus:outline-none ${className || ''} ${contentClassName || ''}`}
        >
          {(title || description || showCloseButton) && (
            <div className="mb-5 flex items-center gap-3 border-b pb-4">
              {(title || description) && (
                <div className="min-w-0 flex-1">
                  {title && (
                    <Dialog.Title className="text-xl font-semibold flex items-center gap-2 before:content-none!">
                      {title}
                    </Dialog.Title>
                  )}

                  {description && <Dialog.Description className="mt-2 text-sm">{description}</Dialog.Description>}
                </div>
              )}

              {showCloseButton && (
                <Dialog.Close asChild>
                  <MtButton kind="icon" size="large" variant="ghost" aria-label="Close" className="shrink-0">
                    <X className="h-4 w-4" />
                  </MtButton>
                </Dialog.Close>
              )}
            </div>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const MtDialogClose = Dialog.Close;
