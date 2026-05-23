import React from 'react';
import { createPortal } from 'react-dom';

interface CollectionToastState {
  message: string;
  key: number;
}

/**
 * Lightweight toast hook for collection layouts.
 * Returns a `showToast` function and a `ToastPortal` component that should be
 * rendered at the end of the layout.
 */
export function useCollectionToast(durationMs = 3000) {
  const [toast, setToast] = React.useState<CollectionToastState | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = React.useCallback(
    (message: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToast({ message, key: Date.now() });
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const ToastPortal = React.useMemo(() => {
    return function CollectionToastPortal() {
      if (!toast) return null;

      return createPortal(
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="rounded-lg border border-border-default bg-surface-subtle px-4 py-2.5 text-sm text-text-primary shadow-[0_10px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            {toast.message}
          </div>
        </div>,
        document.body,
      );
    };
  }, [toast]);

  return { showToast, ToastPortal };
}
