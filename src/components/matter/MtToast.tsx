import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast } from 'radix-ui';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastVariant = 'default' | 'error' | 'success';

interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface MtToastContextValue {
  /** Show a toast with the given message. */
  toast: (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const MtToastContext = createContext<MtToastContextValue | null>(null);

/**
 * Hook to show toasts from anywhere in the app.
 *
 * Returns `null` if no `<MtToastProvider>` is present above in the tree.
 */
export function useMtToast(): MtToastContextValue | null {
  return useContext(MtToastContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

let nextId = 1;

/**
 * Site-wide toast provider built on Radix Toast.
 *
 * Wrap your app root with `<MtToastProvider>` and use the `useMtToast()` hook
 * to dispatch toasts from any component.
 *
 * ```tsx
 * <MtToastProvider>
 *   <App />
 * </MtToastProvider>
 * ```
 */
export function MtToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const toast = useCallback((message: string, options?: { variant?: ToastVariant; durationMs?: number }) => {
    const entry: ToastEntry = {
      id: nextId++,
      message,
      variant: options?.variant ?? 'default',
      durationMs: options?.durationMs ?? 3500,
    };
    setToasts((prev) => [...prev, entry]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <MtToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="down" duration={3500}>
        {children}

        {toasts.map((entry) => (
          <Toast.Root
            key={entry.id}
            duration={entry.durationMs}
            onOpenChange={(open) => {
              if (!open) removeToast(entry.id);
            }}
            className={
              'mt-toast-root rounded-lg border px-4 py-2.5 text-sm shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm ' +
              'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-bottom-2 ' +
              'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-bottom-2 ' +
              'data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] ' +
              'data-[swipe=cancel]:translate-y-0 data-[swipe=cancel]:transition-transform ' +
              'data-[swipe=end]:animate-out data-[swipe=end]:fade-out data-[swipe=end]:slide-out-to-bottom-2 ' +
              (entry.variant === 'error'
                ? 'border-red-500/40 bg-red-950/80 text-red-200'
                : entry.variant === 'success'
                  ? 'border-green-500/40 bg-green-950/80 text-green-200'
                  : 'border-border-default bg-surface-subtle text-text-primary')
            }
          >
            <Toast.Description>{entry.message}</Toast.Description>
          </Toast.Root>
        ))}

        <Toast.Viewport className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2 outline-none" />
      </Toast.Provider>
    </MtToastContext.Provider>
  );
}
